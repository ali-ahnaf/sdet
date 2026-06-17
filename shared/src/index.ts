/**
 * Common objects shared between the api and the client.
 *
 * Anything exported from here is importable as `@sdet/shared` in both
 * workspaces, keeping request/response contracts in a single source of truth.
 */

/** A user as exchanged between client and api. */
export interface User {
  id: string;
  name: string;
  email: string;
}

/** How urgent a todo item is. */
export type TodoPriority = "low" | "medium" | "high";

/** A todo item as exchanged between client and api. */
export interface Todo {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  priority: TodoPriority;
  /** ISO-8601 timestamp. */
  createdAt: string;
  /** ISO-8601 timestamp. */
  updatedAt: string;
}

/** Payload accepted when creating a todo. */
export interface CreateTodoInput {
  title: string;
  notes?: string;
  priority?: TodoPriority;
}

/** Partial payload accepted when updating a todo. */
export interface UpdateTodoInput {
  title?: string;
  notes?: string;
  completed?: boolean;
  priority?: TodoPriority;
}

/** Payload accepted when registering a new account. */
export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

/** Payload accepted when signing in. */
export interface SigninInput {
  email: string;
  password: string;
}

/** Returned by signup/signin: a signed JWT plus the account's public profile. */
export interface AuthResponse {
  /** JWT to send as `Authorization: Bearer <token>` on subsequent requests. */
  token: string;
  user: User;
}

/** Generic envelope used for API responses. */
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

/** Shared health-check payload returned by the api. */
export interface HealthStatus {
  status: "ok";
  uptime: number;
  timestamp: string;
}

/** Routes exposed by the api, referenced by both sides to avoid typos. */
export const API_ROUTES = {
  health: "/api/health",
  users: "/api/users",
  /** Collection route; a single item lives at `${todos}/:id`. */
  todos: "/api/todos",
  auth: {
    signup: "/api/auth/signup",
    signin: "/api/auth/signin",
    /** Current user; requires a `Bearer` token. */
    me: "/api/auth/me",
  },
} as const;

/** Recursively unwraps {@link API_ROUTES} to the union of its string values. */
type RouteValues<T> = T extends string ? T : T extends Record<string, unknown> ? RouteValues<T[keyof T]> : never;

export type ApiRoute = RouteValues<typeof API_ROUTES>;
