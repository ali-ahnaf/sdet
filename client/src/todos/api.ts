/**
 * Typed fetch wrappers for the todos endpoints. The request/response shapes
 * come straight from `@sdet/shared`, so the contract is enforced on both ends.
 * Every call carries the stored JWT (see {@link authHeaders}) so the api can
 * authorize the request.
 */
import {
  API_ROUTES,
  type CreateTodoInput,
  type Todo,
  type UpdateTodoInput,
} from "@sdet/shared";
import { jsonHeaders, unwrap } from "../lib/http";
import { authHeaders } from "../auth/token";

const itemUrl = (id: string) => `${API_ROUTES.todos}/${id}`;

export const todosApi = {
  list: () => fetch(API_ROUTES.todos, { headers: authHeaders() }).then(unwrap<Todo[]>),

  create: (input: CreateTodoInput) =>
    fetch(API_ROUTES.todos, {
      method: "POST",
      headers: { ...jsonHeaders, ...authHeaders() },
      body: JSON.stringify(input),
    }).then(unwrap<Todo>),

  update: (id: string, patch: UpdateTodoInput) =>
    fetch(itemUrl(id), {
      method: "PATCH",
      headers: { ...jsonHeaders, ...authHeaders() },
      body: JSON.stringify(patch),
    }).then(unwrap<Todo>),

  remove: (id: string) =>
    fetch(itemUrl(id), { method: "DELETE", headers: authHeaders() }).then(unwrap<Todo>),
};
