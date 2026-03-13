/**
 * Server-side Cloudflare Turnstile token verification.
 * Returns true if the token is valid, or if TURNSTILE_SECRET_KEY is not set (graceful degradation).
 * Never throws — returns false on any network/parse error.
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstileToken(
  token: string | undefined,
  ip?: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Not configured → skip verification (dev / staging without key)
  if (!secret) return true;
  if (!token)  return false;

  try {
    const response = await fetch(VERIFY_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
    });

    const data = await response.json() as { success: boolean; 'error-codes'?: string[] };

    if (!data.success) {
      console.warn('Turnstile verification failed:', data['error-codes']);
    }

    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}
