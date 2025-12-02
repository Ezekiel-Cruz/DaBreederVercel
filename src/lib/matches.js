import supabase from "./supabaseClient";

const DOG_FIELDS = [
  "id",
  "name",
  "gender",
  "breed",
  "image_url",
  "user_id",
  "match_requests_count",
  "match_accept_count",
  "match_completed_count",
  "match_success_count",
  "match_failure_count",
  "female_successful_matings",
  "male_success_rate",
].join(", ");

const MATCH_SELECT = `
  id,
  status,
  contact_id,
  requester_user_id,
  requested_user_id,
  requester_dog_id,
  requested_dog_id,
  requested_at,
  accepted_at,
  declined_at,
  cancelled_at,
  awaiting_confirmation_at,
  completed_at,
  last_status_changed_at,
  requester_notes,
  responder_notes,
  dog_match_outcomes(id, outcome, litter_size, notes, verified_at, verified_by_user_id, verified_by_dog_id),
  requester_dog:requester_dog_id(${DOG_FIELDS}),
  requested_dog:requested_dog_id(${DOG_FIELDS})
`;

const STATUS_SET = new Set([
  "pending",
  "accepted",
  "declined",
  "cancelled",
  "awaiting_confirmation",
  "completed_success",
  "completed_failed",
]);

const ACTIVE_STATUS_LIST = ["pending", "accepted", "awaiting_confirmation"];
const ACTIVE_REQUEST_STATUSES = new Set(ACTIVE_STATUS_LIST);

async function lookupDogOwnerId(dogId) {
  if (!dogId) return null;
  const { data, error } = await supabase
    .from("dogs")
    .select("user_id")
    .eq("id", dogId)
    .maybeSingle();
  if (error) throw error;
  return data?.user_id || null;
}

async function getActiveRequestForContact(contactId) {
  if (!contactId) return null;
  const { data, error } = await supabase
    .from("dog_match_requests")
    .select("id, status, requester_dog_id, requested_dog_id, requested_at")
    .eq("contact_id", contactId)
    .in("status", ACTIVE_STATUS_LIST)
    .order("requested_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  return Array.isArray(data) && data.length ? data[0] : null;
}

export async function createMatchRequest({
  contactId,
  requesterDogId,
  requestedDogId,
  requesterUserId,
  requestedUserId = null,
  notes = null,
}) {
  if (!contactId) throw new Error("contactId is required");
  if (!requesterDogId || !requestedDogId) {
    throw new Error("Both dogs must be provided to request breeding");
  }
  if (!requesterUserId) throw new Error("requesterUserId is required");
  if (requesterDogId === requestedDogId) {
    throw new Error("Dogs must be different");
  }

  const active = await getActiveRequestForContact(contactId);
  if (active && ACTIVE_REQUEST_STATUSES.has(active.status)) {
    const err = new Error("A breeding request is already awaiting a response in this chat.");
    err.code = "MATCH_REQUEST_EXISTS";
    err.activeRequest = active;
    throw err;
  }

  let targetUserId = requestedUserId;
  if (!targetUserId) {
    targetUserId = await lookupDogOwnerId(requestedDogId);
  }
  if (!targetUserId) {
    throw new Error("Unable to determine the other owner. Please refresh and try again.");
  }

  const payload = {
    contact_id: contactId,
    requester_dog_id: requesterDogId,
    requested_dog_id: requestedDogId,
    requester_user_id: requesterUserId,
    requested_user_id: targetUserId,
    requester_notes: notes || null,
  };

  const { data, error } = await supabase
    .from("dog_match_requests")
    .insert([payload])
    .select(MATCH_SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMatchesForUser(userId) {
  if (!userId) return [];
  let query = supabase
    .from("dog_match_requests")
    .select(MATCH_SELECT)
    .or(`requester_user_id.eq.${userId},requested_user_id.eq.${userId}`)
    .order("requested_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export function mapMatchRecord(row, userId) {
  if (!row) return null;
  const requesterId = row.requester_user_id;
  const myselfIsRequester = userId ? String(requesterId) === String(userId) : false;
  const myDog = myselfIsRequester ? row.requester_dog : row.requested_dog;
  const partnerDog = myselfIsRequester ? row.requested_dog : row.requester_dog;
  const myDogGender = (myDog?.gender || "").toString().toLowerCase();

  // Female dog owners can record all outcomes, male dog owners can only record "no_show"
  const awaitingMyOutcome =
    row.status === "awaiting_confirmation" && (myDogGender === "female" || myDogGender === "male");
  const isMaleDogOwner = myDogGender === "male";

  const userStatus = row.status;
  const outcomeRel = row.dog_match_outcomes;
  const outcome = Array.isArray(outcomeRel) ? outcomeRel[0] || null : outcomeRel || null;
  const isCompleted = row.status === "completed_success" || row.status === "completed_failed";
  const isHistory = isCompleted || row.status === "declined" || row.status === "cancelled";
  const requiresResponse = row.status === "pending" && !myselfIsRequester;
  const canCancel =
    myselfIsRequester &&
    (row.status === "pending" ||
      row.status === "accepted" ||
      row.status === "awaiting_confirmation");

  return {
    ...row,
    myDog,
    partnerDog,
    iAmRequester: myselfIsRequester,
    awaitingMyOutcome,
    isMaleDogOwner, // Add this flag to identify male dog owners
    requiresResponse,
    canCancel,
    outcome,
    userStatus,
    direction: myselfIsRequester ? "sent" : "received",
    isCompleted,
    isHistory,
  };
}

export async function updateMatchStatus(matchId, status) {
  if (!matchId) throw new Error("matchId is required");
  if (!STATUS_SET.has(status)) throw new Error("Unsupported match status");
  const timestampFields = {
    accepted: "accepted_at",
    declined: "declined_at",
    cancelled: "cancelled_at",
    awaiting_confirmation: "awaiting_confirmation_at",
  };
  const patch = { status };
  const tsField = timestampFields[status];
  if (tsField) patch[tsField] = new Date().toISOString();
  if (status === "completed_success" || status === "completed_failed") {
    patch.completed_at = new Date().toISOString();
  }
  const { data, error } = await supabase
    .from("dog_match_requests")
    .update(patch)
    .eq("id", matchId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function acceptMatchRequest(matchId) {
  if (!matchId) throw new Error("matchId is required");
  const now = new Date().toISOString();
  const patch = {
    status: "awaiting_confirmation",
    accepted_at: now,
    awaiting_confirmation_at: now,
    last_status_changed_at: now,
  };
  const { data, error } = await supabase
    .from("dog_match_requests")
    .update(patch)
    .eq("id", matchId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchAwaitingDogIds(dogIds) {
  if (!Array.isArray(dogIds) || dogIds.length === 0) return new Set();
  const filtered = Array.from(new Set(dogIds.filter(Boolean).map((id) => String(id))));
  if (!filtered.length) return new Set();
  const list = filtered.join(",");
  const { data, error } = await supabase
    .from("dog_match_requests")
    .select("requester_dog_id, requested_dog_id")
    .eq("status", "awaiting_confirmation")
    .or(`requester_dog_id.in.(${list}),requested_dog_id.in.(${list})`);
  if (error) throw error;
  const awaiting = new Set();
  (data || []).forEach((row) => {
    if (row?.requester_dog_id) awaiting.add(String(row.requester_dog_id));
    if (row?.requested_dog_id) awaiting.add(String(row.requested_dog_id));
  });
  return awaiting;
}

export async function submitMatchOutcome({
  matchId,
  outcome,
  verifiedDogId,
  litterSize = null,
  notes = null,
}) {
  if (!matchId) throw new Error("matchId is required");
  if (!verifiedDogId) throw new Error("verifiedDogId is required");
  if (!["success", "failed", "no_show"].includes(outcome)) {
    throw new Error("Invalid outcome");
  }
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user?.id) throw new Error("Not authenticated");

  // Backend validation to align with RLS/business rules
  // 1) Ensure the verifying dog exists and belongs to the current user
  const { data: dog, error: dogErr } = await supabase
    .from("dogs")
    .select("id, user_id, gender")
    .eq("id", verifiedDogId)
    .single();
  if (dogErr) throw dogErr;
  if (!dog) throw new Error("Dog not found");
  if (String(dog.user_id) !== String(user.id)) {
    throw new Error("You can only submit outcomes for your own dog");
  }

  // 2) Ensure the verifying dog is part of the match
  const { data: match, error: matchErr } = await supabase
    .from("dog_match_requests")
    .select("id, requester_dog_id, requested_dog_id, status")
    .eq("id", matchId)
    .single();
  if (matchErr) throw matchErr;
  if (!match) throw new Error("Match not found");
  if (
    String(match.requester_dog_id) !== String(verifiedDogId) &&
    String(match.requested_dog_id) !== String(verifiedDogId)
  ) {
    throw new Error("Selected dog is not part of this match");
  }

  // 3) Enforce gender-based permissions consistent with RLS
  const dogGender = (dog.gender || "").toString().toLowerCase();
  if (dogGender === "male" && outcome !== "no_show") {
    throw new Error("Male dog's owner may only submit the 'Didn't show up' outcome");
  }

  // 4) Normalize and validate litter size and notes based on outcome
  let finalLitterSize = null;
  const trimmedNotes = (notes || "").trim();
  if (outcome === "success") {
    const n = Number(litterSize);
    if (!Number.isFinite(n) || n < 1) {
      throw new Error("For success, litter size must be at least 1");
    }
    if (!trimmedNotes) {
      throw new Error("Notes are required for successful breeding");
    }
    finalLitterSize = n;
  } else if (outcome === "failed") {
    finalLitterSize = 0; // No pregnancy
    // Notes optional for failed
  } else if (outcome === "no_show") {
    finalLitterSize = 0;
    if (!trimmedNotes) {
      throw new Error("Notes are required for no show outcome");
    }
  }

  const payload = {
    match_id: matchId,
    verified_by_user_id: user.id,
    verified_by_dog_id: verifiedDogId,
    outcome,
    litter_size: finalLitterSize,
    notes: trimmedNotes || null,
  };

  const { data, error: insertError } = await supabase
    .from("dog_match_outcomes")
    .insert([payload])
    .select()
    .single();
  if (insertError) throw insertError;
  return data;
}
