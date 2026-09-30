/**
 * A tiny, hard-wearing persistence layer.
 *
 * localStorage is a hostile environment: browsers hand back `null`, quota
 * errors, JSON for *other* apps, and data written by older versions of this
 * app. Every read is treated as untrusted and every write as best-effort.
 */

const SCHEMA_VERSION = 1

export interface StorageEnvelope<T> {
  v: number
  data: T
}

/**
 * Read and validate a versioned envelope.
 *
 * Returns `fallback` for any of: unavailable storage, missing key, malformed
 * JSON, wrong shape, or a future schema version this build does not know.
 * Never throws.
 */
export function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback

    const parsed: unknown = JSON.parse(raw)

    // Data written before the envelope existed is still usable if the shape
    // happens to match; otherwise it is dropped.
    if (parsed && typeof parsed === 'object' && 'v' in parsed && 'data' in parsed) {
      const env = parsed as StorageEnvelope<T>
      if (env.v === SCHEMA_VERSION && isValidData(env.data, fallback)) {
        return env.data
      }
    }

    // Legacy unversioned payload.
    if (isValidData(parsed, fallback)) {
      return parsed as T
    }
  } catch {
    /* Corrupted or unreadable — fall through to the default. */
  }
  return fallback
}

/** Write a versioned envelope. Silently ignores quota / private-mode failures. */
export function saveStorage<T>(key: string, data: T): void {
  try {
    const envelope: StorageEnvelope<T> = { v: SCHEMA_VERSION, data }
    localStorage.setItem(key, JSON.stringify(envelope))
  } catch {
    /* Storage is a cache of convenience, not a source of truth. */
  }
}

/** Remove a key. */
export function clearStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* noop */
  }
}

/**
 * Structural check that a value read from storage is safe to use as `T`.
 *
 * For arrays we only confirm it *is* an array — elements are validated by the
 * caller (see `useSessions`), because a partially-corrupt array is still
 * worth filtering rather than discarding wholesale.
 */
function isValidData<T>(value: unknown, fallback: T): boolean {
  if (Array.isArray(fallback)) return Array.isArray(value)
  return typeof value === typeof fallback
}
