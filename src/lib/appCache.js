import { createCache } from "./cache";

export const DOGS_CACHE_TTL_MS = 5 * 60 * 1000;
export const MATCHES_CACHE_TTL_MS = 2 * 60 * 1000;

export const DOGS_STORAGE_PREFIX = "db:dogs:";
export const MATCHES_STORAGE_PREFIX = "db:matches:";
export const DOG_DETAIL_STORAGE_PREFIX = "db:dog:";

export function getDogsCache() {
  return (globalThis.__DB_DOGS_CACHE__ = globalThis.__DB_DOGS_CACHE__ || {});
}

export function getMatchesCache() {
  return (globalThis.__DB_MATCHES_CACHE__ = globalThis.__DB_MATCHES_CACHE__ || {});
}

const dogsRecordCache = createCache("dogs-records", { storage: "memory" });
const matchesRecordCache = createCache("matches-records", { storage: "memory" });

export function getDogsCacheEntry(key) {
  const fromRecord = dogsRecordCache.get(key);
  if (fromRecord) return fromRecord;
  return getDogsCache()[key] || null;
}

export function setDogsCacheEntry(key, entry) {
  dogsRecordCache.set(key, entry);
  getDogsCache()[key] = entry;
  return entry;
}

export function deleteDogsCacheEntry(key) {
  dogsRecordCache.delete(key);
  const dogsCache = getDogsCache();
  if (dogsCache[key]) delete dogsCache[key];
}

export function getMatchesCacheEntry(key) {
  const fromRecord = matchesRecordCache.get(key);
  if (fromRecord) return fromRecord;
  return getMatchesCache()[key] || null;
}

export function setMatchesCacheEntry(key, entry) {
  matchesRecordCache.set(key, entry);
  getMatchesCache()[key] = entry;
  return entry;
}

export function deleteMatchesCacheEntry(key) {
  matchesRecordCache.delete(key);
  const matchesCache = getMatchesCache();
  if (matchesCache[key]) delete matchesCache[key];
}

export function userCacheKey(userId) {
  return userId ? `u:${userId}` : "anon";
}

export function matchesCacheKey(userId) {
  return userId ? `matches:${userId}` : "anon";
}

export function dogsStorageKey(userId) {
  return userId ? `${DOGS_STORAGE_PREFIX}${userId}` : null;
}

export function matchesStorageKey(userId) {
  return userId ? `${MATCHES_STORAGE_PREFIX}${userId}` : null;
}

export function dogDetailStorageKey(dogId) {
  return dogId ? `${DOG_DETAIL_STORAGE_PREFIX}${dogId}` : null;
}
