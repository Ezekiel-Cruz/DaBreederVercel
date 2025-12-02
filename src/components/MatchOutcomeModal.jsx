import React, { useEffect, useState } from "react";
import Modal from "./Modal";

export default function MatchOutcomeModal({ open, onClose, onSubmit, match }) {
  const [outcome, setOutcome] = useState("success");
  const [litterSize, setLitterSize] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const isMaleDogOwner = !!match?.isMaleDogOwner;

  useEffect(() => {
    if (open) {
      // Male dog owners can only select "no_show", so default to that
      if (match?.isMaleDogOwner) {
        setOutcome("no_show");
        setLitterSize("");
      } else {
        setOutcome("success");
        setLitterSize("1");
      }
      setNotes("");
    }
  }, [open, match]);

  // Auto-set litter size to 0 when "No pregnancy" is selected
  useEffect(() => {
    if (outcome === "failed") {
      setLitterSize("0");
    } else if (outcome === "no_show") {
      setLitterSize(""); // Clear for no show since it won't be shown
    } else if (outcome === "success") {
      setLitterSize((v) => {
        const n = Number(v);
        if (!v || !Number.isFinite(n) || n < 1) return "1";
        return v;
      });
    }
  }, [outcome]);

  if (!match) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);

    // Conditional validation based on outcome
    // For "success": require litter size and notes
    if (outcome === "success") {
      if (litterSize === "" || Number(litterSize) < 1) {
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: { message: "For success, litter size must be at least 1", type: "warning" },
          })
        );
        setBusy(false);
        return;
      }
      if (!notes || notes.trim().length === 0) {
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: { message: "Notes are required for successful breeding", type: "warning" },
          })
        );
        setBusy(false);
        return;
      }
    }

    // For "failed" (no pregnancy): litter size is auto-set to 0, notes are optional
    // No validation needed for notes in this case

    // For "no_show": require notes, litter size not shown/used
    if (outcome === "no_show") {
      if (!notes || notes.trim().length === 0) {
        window.dispatchEvent(
          new CustomEvent("toast", {
            detail: { message: "Notes are required for no show outcome", type: "warning" },
          })
        );
        setBusy(false);
        return;
      }
    }

    // Determine final litter size value
    let finalLitterSize;
    if (outcome === "no_show") {
      finalLitterSize = 0; // No show defaults to 0
    } else if (outcome === "failed") {
      finalLitterSize = 0; // No pregnancy is 0
    } else {
      finalLitterSize = Number(litterSize);
    }

    try {
      await onSubmit({
        matchId: match.id,
        outcome,
        verifiedDogId: match.myDog?.id,
        litterSize: finalLitterSize,
        notes: notes.trim() || "", // Allow empty notes for "failed"
      });
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { message: "Outcome recorded", type: "success" },
        })
      );
      onClose();
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: { message: err.message || "Failed to record outcome", type: "error" },
        })
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={busy ? undefined : onClose} widthClass="max-w-xl">
      <form onSubmit={handleSubmit} className="p-8 space-y-5 relative">
        {/* Paw Print Decoration */}
        <div className="absolute -right-6 -top-6 opacity-5 pointer-events-none">
          <svg
            width="180"
            height="180"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-amber-900"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.22-7.52-3.22 3.22 7.52 3.22-7.52-3.22-7.52-3.22 7.52zM7 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm10 0c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-amber-900">Confirm breeding outcome</h2>
          <p className="text-sm text-slate-600 mt-1">
            Let the community know how the pairing between {match.myDog?.name} and{" "}
            {match.partnerDog?.name} went.
          </p>
        </div>

        {isMaleDogOwner && (
          <div className="relative z-10 rounded-xl border border-orange-200 bg-orange-50 text-amber-900 px-4 py-3">
            If the female dog didn't show up, you can submit the "Didn't show up" outcome. For other
            outcomes, please ask the owner of {match.partnerDog?.name} to confirm.
          </div>
        )}

        <div className="space-y-2 relative z-10">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Outcome
          </label>
          <div className="flex gap-3">
            {/* Male dog owners can only select "No show" */}
            {match.isMaleDogOwner ? (
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="outcome"
                  value="no_show"
                  checked={outcome === "no_show"}
                  onChange={() => setOutcome("no_show")}
                  className="accent-orange-500 cursor-pointer w-4 h-4"
                />
                Didn't show up
              </label>
            ) : (
              // Female dog owners can select all  options
              [
                { value: "success", label: "Success" },
                { value: "failed", label: "No pregnancy" },
                { value: "no_show", label: "Didn't show up" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="outcome"
                    value={opt.value}
                    checked={outcome === opt.value}
                    onChange={() => setOutcome(opt.value)}
                    className="accent-orange-500 cursor-pointer w-4 h-4"
                  />
                  {opt.label}
                </label>
              ))
            )}
          </div>
        </div>

        {/* Litter Size - Only show for Success and No Pregnancy */}
        {outcome !== "no_show" && (
          <div className="space-y-2 relative z-10">
            <label
              className="text-xs font-bold uppercase tracking-wider text-amber-900"
              htmlFor="litter-size-input"
            >
              Litter size {outcome === "success" && <span className="text-rose-600">*</span>}
            </label>
            <input
              id="litter-size-input"
              type="number"
              min={outcome === "success" ? "1" : "0"}
              value={litterSize}
              onChange={(e) => {
                const val = e.target.value;
                if (outcome === "success") {
                  const n = Number(val);
                  if (!Number.isFinite(n) || n < 1) {
                    setLitterSize("1");
                  } else {
                    setLitterSize(val);
                  }
                } else {
                  setLitterSize(val);
                }
              }}
              required={outcome === "success"}
              disabled={outcome === "failed"}
              readOnly={outcome === "failed"}
              className={`w-full rounded-xl border-2 border-orange-100 bg-white px-4 py-3 text-slate-700 focus:border-orange-400 focus:outline-none focus:ring-0 transition-colors ${
                outcome === "failed" ? "bg-orange-50/50 cursor-not-allowed" : ""
              }`}
            />
            {outcome === "failed" && (
              <p className="text-xs text-slate-500 mt-1">Automatically set to 0 for no pregnancy</p>
            )}
          </div>
        )}

        <div className="space-y-2 relative z-10">
          <label
            className="text-xs font-bold uppercase tracking-wider text-amber-900"
            htmlFor="outcome-notes"
          >
            Notes{" "}
            {(outcome === "success" || outcome === "no_show") && (
              <span className="text-rose-600">*</span>
            )}
            {outcome === "failed" && (
              <span className="text-xs text-slate-500 normal-case font-normal ml-1">
                (Optional)
              </span>
            )}
          </label>
          <textarea
            id="outcome-notes"
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              outcome === "success"
                ? "Share any helpful observations for future pairings"
                : outcome === "no_show"
                  ? "Please explain why the breeding didn't happen"
                  : "Add any additional notes (optional)"
            }
            required={outcome === "success" || outcome === "no_show"}
            className="w-full rounded-xl border-2 border-orange-100 bg-white px-4 py-3 text-slate-700 placeholder-slate-400 focus:border-orange-400 focus:outline-none focus:ring-0 transition-colors resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 relative z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-6 py-3 rounded-xl bg-orange-50 text-sm font-bold text-amber-900 hover:bg-orange-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              busy ||
              !match.myDog?.id ||
              // For success: require litter size and notes
              (outcome === "success" &&
                (litterSize === "" ||
                  Number(litterSize) < 1 ||
                  !notes ||
                  notes.trim().length === 0)) ||
              // For no_show: only require notes
              (outcome === "no_show" && (!notes || notes.trim().length === 0))
              // For failed: no requirements, litter auto-set to 0, notes optional
            }
            className="px-6 py-3 rounded-xl bg-linear-to-r from-orange-400 to-amber-500 text-sm font-bold uppercase tracking-wide text-white shadow-lg hover:from-orange-500 hover:to-amber-600 disabled:opacity-50 transition-all transform active:scale-95"
          >
            {busy ? "Saving…" : "Save outcome"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
