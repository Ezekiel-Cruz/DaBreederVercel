import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import useDogMatches from "../useDogMatches";
import { AuthContext } from "../../context/AuthContext";

const fetchMatchesForUser = vi.fn();
const acceptMatchRequest = vi.fn();

vi.mock("../../lib/supabaseClient", () => ({
  __esModule: true,
  default: {
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {},
  },
}));

vi.mock("../../lib/matches", () => ({
  acceptMatchRequest: (...args) => acceptMatchRequest(...args),
  fetchMatchesForUser: (...args) => fetchMatchesForUser(...args),
  mapMatchRecord: (row) => row,
  submitMatchOutcome: vi.fn(),
  updateMatchStatus: vi.fn(),
}));

describe("useDogMatches cache invalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.__DB_MATCHES_CACHE__ = {};
  });

  it("refreshes cached matches after acceptMatch invalidation", async () => {
    fetchMatchesForUser
      .mockResolvedValueOnce([{ id: "m1", status: "pending", userStatus: "pending" }])
      .mockResolvedValueOnce([{ id: "m1", status: "accepted", userStatus: "accepted" }]);

    acceptMatchRequest.mockResolvedValue({});

    const wrapper = ({ children }) => (
      <AuthContext.Provider value={{ user: { id: "u1" } }}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useDogMatches(), { wrapper });

    await waitFor(() => {
      expect(result.current.matches).toHaveLength(1);
      expect(result.current.matches[0].userStatus).toBe("pending");
    });

    expect(globalThis.__DB_MATCHES_CACHE__["matches:u1"]?.matches?.[0]?.userStatus).toBe("pending");

    await act(async () => {
      await result.current.acceptMatch("m1");
    });

    await waitFor(() => {
      expect(result.current.matches[0].userStatus).toBe("accepted");
    });

    expect(acceptMatchRequest).toHaveBeenCalledWith("m1");
    expect(fetchMatchesForUser).toHaveBeenCalledTimes(2);
    expect(globalThis.__DB_MATCHES_CACHE__["matches:u1"]?.matches?.[0]?.userStatus).toBe(
      "accepted"
    );
  });
});
