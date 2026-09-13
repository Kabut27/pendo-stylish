// lib/rateLimit.js
// Rate limiting rahisi ya in-memory (haihitaji Redis) - inatosha kwa VPS moja
// inayoendesha instance moja ya PM2. Inazuia majaribio mengi ya password
// kwa haraka kwenye ukurasa wa login.

const attempts = new Map(); // key -> { count, firstAttemptAt }

const WINDOW_MS = 10 * 60 * 1000; // dirisha la dakika 10
const MAX_ATTEMPTS = 8;

// Safisha kumbukumbu za zamani mara kwa mara ili Map isiendelee kukua milele
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of attempts.entries()) {
    if (now - val.firstAttemptAt > WINDOW_MS) attempts.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

/**
 * @param {string} key - mfano `login:${ip}` au `login:${ip}:${username}`
 * @returns {{ allowed: boolean, retryAfterSeconds?: number }}
 */
export function checkRateLimit(key) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now - entry.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now });
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - entry.firstAttemptAt)) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true };
}

export function resetRateLimit(key) {
  attempts.delete(key);
}
