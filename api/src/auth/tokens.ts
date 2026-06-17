import jwt from "jsonwebtoken";

/**
 * Signing/verifying for the access tokens issued by the auth routes.
 *
 * The secret comes from `JWT_SECRET`; a throwaway default keeps local dev
 * working out of the box, but it must be set in any real deployment.
 */
const JWT_SECRET: string = process.env.JWT_SECRET ?? "dev-insecure-secret-change-me";

/** Token lifetime in seconds (default: 1 hour). */
const JWT_EXPIRES_IN_SECONDS = Number(process.env.JWT_EXPIRES_IN_SECONDS) || 3600;

if (!process.env.JWT_SECRET) {
  console.warn("[auth] JWT_SECRET is not set — using an insecure development secret. " + "Set JWT_SECRET before deploying.");
}

/** Claims embedded in an access token. */
export interface AuthTokenPayload {
  /** Subject — the user's id. */
  sub: string;
  email: string;
}

/** Sign a short-lived access token for the given user. */
export function signAuthToken(payload: AuthTokenPayload): string {
  const { sub, email } = payload;
  return jwt.sign({ email }, JWT_SECRET, {
    subject: sub,
    expiresIn: JWT_EXPIRES_IN_SECONDS,
  });
}

/**
 * Verify a token and return its claims. Throws if the token is missing,
 * malformed, tampered with, or expired.
 */
export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (typeof decoded === "string" || typeof decoded.sub !== "string" || typeof decoded.email !== "string") {
    throw new Error("Malformed token payload.");
  }
  return { sub: decoded.sub, email: decoded.email };
}
