import { beforeEach, describe, expect, it } from "vitest";
import {
  deleteDogsCacheEntry,
  deleteMatchesCacheEntry,
  dogsStorageKey,
  getDogsCache,
  getDogsCacheEntry,
  getMatchesCache,
  getMatchesCacheEntry,
  matchesStorageKey,
  setDogsCacheEntry,
  setMatchesCacheEntry,
  userCacheKey,
} from "../appCache";

describe("appCache adapters", () => {
  beforeEach(() => {
    globalThis.__DB_DOGS_CACHE__ = {};
    globalThis.__DB_MATCHES_CACHE__ = {};
  });

  it("stores and reads dogs entries through adapter and global mirror", () => {
    const key = userCacheKey("abc");
    const entry = { dogs: [{ id: 1 }], lastFetch: 123, error: null };

    setDogsCacheEntry(key, entry);

    expect(getDogsCacheEntry(key)).toEqual(entry);
    expect(getDogsCache()[key]).toEqual(entry);
  });

  it("deletes dogs entries from adapter and global mirror", () => {
    const key = userCacheKey("abc");
    setDogsCacheEntry(key, { dogs: [{ id: 1 }], lastFetch: 123, error: null });

    deleteDogsCacheEntry(key);

    expect(getDogsCacheEntry(key)).toBeNull();
    expect(getDogsCache()[key]).toBeUndefined();
  });

  it("stores and deletes matches entries through adapter and global mirror", () => {
    const key = "matches:abc";
    const entry = { matches: [{ id: 9 }], fetchedAt: 456, error: null };

    setMatchesCacheEntry(key, entry);
    expect(getMatchesCacheEntry(key)).toEqual(entry);
    expect(getMatchesCache()[key]).toEqual(entry);

    deleteMatchesCacheEntry(key);
    expect(getMatchesCacheEntry(key)).toBeNull();
    expect(getMatchesCache()[key]).toBeUndefined();
  });

  it("builds stable storage keys", () => {
    expect(dogsStorageKey("u1")).toBe("db:dogs:u1");
    expect(matchesStorageKey("u1")).toBe("db:matches:u1");
  });
});
