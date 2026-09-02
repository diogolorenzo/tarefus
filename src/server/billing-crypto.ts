import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Computes a standard HMAC SHA-256 signature in hexadecimal.
 */
export function computeHmacSha256(payload: string | Buffer, secret: string): string {
  if (typeof secret !== 'string' || secret.length === 0) {
    throw new Error('Secret must be a non-empty string');
  }
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Computes a canonical SHA-256 digest prefixed with 'sha256:'.
 */
export function computeSha256(payload: string | Buffer): string {
  const hash = createHash('sha256').update(payload).digest('hex');
  return `sha256:${hash}`;
}

/**
 * Compares two hexadecimal strings in constant time to protect against timing attacks.
 */
export function secureCompareHex(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return false;
  }

  // Ensure only valid hexadecimal characters are compared
  if (!/^[0-9a-fA-F]+$/.test(a) || !/^[0-9a-fA-F]+$/.test(b)) {
    return false;
  }

  try {
    const bufA = Buffer.from(a.toLowerCase(), 'hex');
    const bufB = Buffer.from(b.toLowerCase(), 'hex');
    if (bufA.length !== bufB.length || bufA.length === 0) {
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Verifies if an ISO 8601 string or Unix timestamp (seconds or ms) is within the tolerance window.
 * Default tolerance is 300,000 ms (5 minutes).
 */
export function isTimestampWithinTolerance(
  timestampIsoOrUnix: string | number,
  toleranceMs: number = 300_000,
  nowMs: number = Date.now(),
): boolean {
  if (typeof timestampIsoOrUnix !== 'string' && typeof timestampIsoOrUnix !== 'number') {
    return false;
  }

  let timestampMs: number;
  if (typeof timestampIsoOrUnix === 'number') {
    if (!Number.isFinite(timestampIsoOrUnix) || timestampIsoOrUnix <= 0) {
      return false;
    }
    // If greater than 10^11, assume milliseconds; otherwise assume epoch seconds
    timestampMs = timestampIsoOrUnix > 1e11 ? timestampIsoOrUnix : timestampIsoOrUnix * 1000;
  } else {
    // Check if numeric string in seconds or ms
    if (/^\d+$/.test(timestampIsoOrUnix)) {
      const num = Number(timestampIsoOrUnix);
      if (!Number.isFinite(num) || num <= 0) return false;
      timestampMs = num > 1e11 ? num : num * 1000;
    } else {
      timestampMs = Date.parse(timestampIsoOrUnix);
    }
  }

  if (Number.isNaN(timestampMs) || !Number.isFinite(timestampMs)) {
    return false;
  }

  return Math.abs(nowMs - timestampMs) <= toleranceMs;
}
