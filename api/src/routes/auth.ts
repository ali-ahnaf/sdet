import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { Router, type Response } from "express";
import { API_ROUTES, type ApiResponse, type AuthResponse, type SigninInput, type SignupInput, type User as PublicUser } from "@sdet/shared";
import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";
import { signAuthToken } from "../auth/tokens.js";
import { requireAuth } from "../middleware/auth.js";

/**
 * Signup / signin backed by the `users` table (see {@link User}). Passwords are
 * never stored in the clear — only a salted scrypt hash. A successful signup or
 * signin returns a signed JWT the client sends back as `Authorization: Bearer`.
 */
export const authRouter = Router();

/** The users repository, resolved lazily so it's ready after DataSource init. */
const userRepo = () => AppDataSource.getRepository(User);

const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

const KEY_LENGTH = 64;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST /api/auth/signup — register an account and return a token. */
authRouter.post(API_ROUTES.auth.signup, async (req, res) => {
  const input = req.body as Partial<SignupInput>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!name) {
    return fail(res, 400, "A name is required.");
  }
  if (!EMAIL_RE.test(email)) {
    return fail(res, 400, "A valid email is required.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return fail(res, 400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const repo = userRepo();
  if (await repo.findOne({ where: { email } })) {
    return fail(res, 409, "An account with that email already exists.");
  }

  const user = await repo.save(
    repo.create({ name, email, passwordHash: await hashPassword(password) }),
  );

  res.status(201).json(authResponse(user));
});

/** POST /api/auth/signin — exchange credentials for a token. */
authRouter.post(API_ROUTES.auth.signin, async (req, res) => {
  const input = req.body as Partial<SigninInput>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";

  const user = await userRepo().findOne({ where: { email } });
  // Same message whether the email is unknown or the password is wrong, so we
  // don't reveal which emails are registered.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return fail(res, 401, "Invalid email or password.");
  }

  res.json(authResponse(user));
});

/** GET /api/auth/me — the authenticated user's profile. */
authRouter.get(API_ROUTES.auth.me, requireAuth, async (req, res) => {
  const user = await userRepo().findOne({ where: { id: req.user!.sub } });
  if (!user) {
    return fail(res, 404, "Account no longer exists.");
  }
  const body: ApiResponse<PublicUser> = { data: user.toPublicUser() };
  res.json(body);
});

/** Build the token + public-profile envelope returned by signup/signin. */
function authResponse(user: User): ApiResponse<AuthResponse> {
  const token = signAuthToken({ sub: user.id, email: user.email });
  return { data: { token, user: user.toPublicUser() } };
}

/** Hash a password as `"<saltHex>:<hashHex>"` using a per-password salt. */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

/** Constant-time comparison of a password against a stored scrypt hash. */
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) {
    return false;
  }
  const expected = Buffer.from(hashHex, "hex");
  const derived = await scrypt(password, Buffer.from(saltHex, "hex"), KEY_LENGTH);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/** Send an {@link ApiResponse} error envelope with the given status. */
function fail(res: Response, status: number, error: string) {
  const body: ApiResponse<null> = { data: null, error };
  res.status(status).json(body);
}
