/**
 * Typed fetch wrappers for the auth endpoints. On a successful signup/signin the
 * returned JWT is saved (see {@link tokenStore}) so later requests can send it
 * as a bearer token; the client-safe {@link User} profile is handed back.
 */
import {
  API_ROUTES,
  type AuthResponse,
  type SigninInput,
  type SignupInput,
  type User,
} from "@sdet/shared";
import { jsonHeaders, unwrap } from "../lib/http";
import { authHeaders, tokenStore } from "./token";

/** POST credentials, persist the returned token, and return the profile. */
async function authenticate(url: string, body: SignupInput | SigninInput): Promise<User> {
  const auth = await fetch(url, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(body),
  }).then(unwrap<AuthResponse>);
  tokenStore.set(auth.token);
  return auth.user;
}

export const authApi = {
  signup: (input: SignupInput) => authenticate(API_ROUTES.auth.signup, input),

  signin: (input: SigninInput) => authenticate(API_ROUTES.auth.signin, input),

  /** The current user for the stored token; throws if unauthenticated. */
  me: (): Promise<User> =>
    fetch(API_ROUTES.auth.me, { headers: authHeaders() }).then(unwrap<User>),

  signOut: () => tokenStore.clear(),
};
