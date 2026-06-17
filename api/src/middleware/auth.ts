import type { NextFunction, Request, Response } from "express";
import type { ApiResponse } from "@sdet/shared";
import { verifyAuthToken, type AuthTokenPayload } from "../auth/tokens.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Decoded token claims, set by {@link requireAuth} on success. */
      user?: AuthTokenPayload;
    }
  }
}

const BEARER_PREFIX = "Bearer ";

/**
 * Gate a route behind a valid JWT. Reads the token from the
 * `Authorization: Bearer <token>` header, verifies it, and attaches the
 * decoded claims to `req.user`. Responds 401 when the header is absent or
 * malformed, or when the token fails verification.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith(BEARER_PREFIX)) {
    return unauthorized(res, "Missing or malformed Authorization header.");
  }

  const token = header.slice(BEARER_PREFIX.length).trim();
  if (!token) {
    return unauthorized(res, "Missing bearer token.");
  }

  try {
    req.user = verifyAuthToken(token);
    next();
  } catch {
    unauthorized(res, "Invalid or expired token.");
  }
}

/** Send an {@link ApiResponse} 401 error envelope. */
function unauthorized(res: Response, error: string) {
  const body: ApiResponse<null> = { data: null, error };
  res.status(401).json(body);
}
