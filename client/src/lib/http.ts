/**
 * Shared fetch helpers. The {@link ApiResponse} envelope is the contract for
 * every endpoint, so unwrapping and the JSON content-type live in one place.
 */
import { type ApiResponse } from "@sdet/shared";

export const jsonHeaders = { "Content-Type": "application/json" };

/** Parse an {@link ApiResponse} envelope, throwing on transport or API errors. */
export async function unwrap<T>(res: Response): Promise<T> {
  let body: ApiResponse<T> | undefined;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    // fall through to the status-based error below
  }
  if (!res.ok || body?.error) {
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  if (!body) {
    throw new Error("Empty response from the server.");
  }
  return body.data;
}
