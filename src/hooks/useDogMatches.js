import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import supabase from "../lib/supabaseClient";
import { AuthContext } from "../context/AuthContext";
import {
  acceptMatchRequest,
  fetchMatchesForUser,
  mapMatchRecord,
  submitMatchOutcome,
  updateMatchStatus,
} from "../lib/matches";
import {
  deleteMatchesCacheEntry,
  getMatchesCacheEntry,
  MATCHES_CACHE_TTL_MS,
  matchesCacheKey,
  matchesStorageKey,
  setMatchesCacheEntry,
} from "../lib/appCache";

const TTL = MATCHES_CACHE_TTL_MS;

export default function useDogMatches(options = {}) {
  const { user } = useContext(AuthContext) || {};
  const userId = options.userId || user?.id || null;
  const cacheKey = matchesCacheKey(userId);

  const [matches, setMatches] = useState(() => getMatchesCacheEntry(cacheKey)?.matches || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeRef = useRef(0);
  const matchesRef = useRef(getMatchesCacheEntry(cacheKey)?.matches || []);
  const storageKey = matchesStorageKey(userId);

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.matches?.length && matchesRef.current.length === 0) {
          setMatches(parsed.matches);
          matchesRef.current = parsed.matches;
        }
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  useEffect(() => {
    matchesRef.current = matches;
    if (!storageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ matches, ts: Date.now() }));
    } catch {
      /* ignore quota */
    }
  }, [matches, storageKey]);

  const load = useCallback(
    async (force = false) => {
      if (!userId) {
        setMatches([]);
        setError(null);
        setLoading(false);
        return [];
      }
      const cache = getMatchesCacheEntry(cacheKey);
      const fresh = cache && Date.now() - cache.fetchedAt < TTL;
      if (!force && fresh) {
        setMatches(cache.matches || []);
        setError(cache.error || null);
        return cache.matches || [];
      }

      const requestId = ++activeRef.current;
      try {
        setLoading(true);
        setError(null);
        const rows = await fetchMatchesForUser(userId);
        const mapped = rows.map((row) => mapMatchRecord(row, userId));
        if (activeRef.current !== requestId) return mapped;
        const fetchedAt = Date.now();
        setMatchesCacheEntry(cacheKey, { matches: mapped, fetchedAt, error: null });
        setMatches(mapped);
        return mapped;
      } catch (err) {
        if (activeRef.current !== requestId) return [];
        setMatchesCacheEntry(cacheKey, {
          matches: matchesRef.current,
          fetchedAt: Date.now(),
          error: err,
        });
        setError(err);
        if (matchesRef.current.length) {
          setMatches(matchesRef.current);
          return matchesRef.current;
        }
        setMatches([]);
        return [];
      } finally {
        if (activeRef.current === requestId) setLoading(false);
      }
    },
    [cacheKey, userId]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleFocus = () => load(true);
    const handleOnline = () => load(true);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
    };
  }, [load]);

  // optional realtime refresh when own matches change (requester or requested)
  useEffect(() => {
    if (!userId) return undefined;
    const channels = [
      supabase
        .channel(`match-requests-requester-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "dog_match_requests",
            filter: `requester_user_id=eq.${userId}`,
          },
          () => load(true)
        )
        .subscribe(),
      supabase
        .channel(`match-requests-requested-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "dog_match_requests",
            filter: `requested_user_id=eq.${userId}`,
          },
          () => load(true)
        )
        .subscribe(),
    ];
    return () => {
      channels.forEach((ch) => {
        try {
          supabase.removeChannel(ch);
        } catch {
          /* noop */
        }
      });
    };
  }, [userId, load]);

  const summary = useMemo(() => {
    const totals = {
      total: matches.length,
      pending: 0,
      accepted: 0,
      awaitingConfirmation: 0,
      successes: 0,
      failures: 0,
      declines: 0,
    };
    for (const match of matches) {
      const status = match.userStatus || match.status;
      switch (status) {
        case "pending":
          totals.pending += 1;
          break;
        case "accepted":
          totals.accepted += 1;
          break;
        case "awaiting_confirmation":
          totals.awaitingConfirmation += 1;
          break;
        case "completed_success":
          totals.successes += 1;
          break;
        case "completed_failed":
          totals.failures += 1;
          break;
        case "declined":
        case "cancelled":
          totals.declines += 1;
          break;
        default:
      }
    }
    return totals;
  }, [matches]);

  const grouped = useMemo(() => {
    const pending = [];
    const accepted = [];
    const awaiting = [];
    const history = [];
    matches.forEach((m) => {
      const status = m.userStatus || m.status;
      if (status === "pending") pending.push(m);
      else if (status === "accepted") accepted.push(m);
      else if (status === "awaiting_confirmation") awaiting.push(m);
      else history.push(m);
    });
    return { pending, accepted, awaiting, history };
  }, [matches]);

  const refetch = useCallback(() => load(true), [load]);

  const changeStatus = useCallback(
    async (matchId, status) => {
      await updateMatchStatus(matchId, status);
      deleteMatchesCacheEntry(cacheKey);
      await load(true);
    },
    [cacheKey, load]
  );

  const acceptMatch = useCallback(
    async (matchId) => {
      await acceptMatchRequest(matchId);
      deleteMatchesCacheEntry(cacheKey);
      await load(true);
    },
    [cacheKey, load]
  );

  const recordOutcome = useCallback(
    async ({ matchId, outcome, verifiedDogId, litterSize, notes }) => {
      await submitMatchOutcome({ matchId, outcome, verifiedDogId, litterSize, notes });
      deleteMatchesCacheEntry(cacheKey);
      await load(true);
    },
    [cacheKey, load]
  );

  return {
    matches,
    pendingMatches: grouped.pending,
    acceptedMatches: grouped.accepted,
    awaitingConfirmationMatches: grouped.awaiting,
    historyMatches: grouped.history,
    summary,
    loading,
    error,
    refetch,
    acceptMatch,
    updateStatus: changeStatus,
    submitOutcome: recordOutcome,
  };
}
