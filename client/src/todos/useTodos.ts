import { useCallback, useEffect, useState } from "react";
import type { CreateTodoInput, Todo, UpdateTodoInput } from "@sdet/shared";
import { todosApi } from "./api";

export type TodoFilter = "all" | "active" | "completed";

interface UseTodos {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  add: (input: CreateTodoInput) => Promise<void>;
  update: (id: string, patch: UpdateTodoInput) => Promise<void>;
  toggle: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  reload: () => void;
}

/**
 * Owns the todo collection and the CRUD actions over it. State is updated from
 * each endpoint's response so the UI stays in lockstep with the api.
 */
export function useTodos(): UseTodos {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    todosApi
      .list()
      .then((data) => {
        setTodos(data);
        setError(null);
      })
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(reload, [reload]);

  /** Run a mutation, fold its result into state, and surface failures. */
  const run = useCallback(
    async (action: () => Promise<Todo[]>) => {
      try {
        setTodos(await action());
        setError(null);
      } catch (err: unknown) {
        setError(errorMessage(err));
      }
    },
    [],
  );

  const add = useCallback(
    (input: CreateTodoInput) =>
      run(async () => {
        const created = await todosApi.create(input);
        return [created, ...todos];
      }),
    [run, todos],
  );

  const update = useCallback(
    (id: string, patch: UpdateTodoInput) =>
      run(async () => {
        const updated = await todosApi.update(id, patch);
        return todos.map((t) => (t.id === id ? updated : t));
      }),
    [run, todos],
  );

  const toggle = useCallback(
    (id: string) => {
      const current = todos.find((t) => t.id === id);
      if (!current) return Promise.resolve();
      return update(id, { completed: !current.completed });
    },
    [todos, update],
  );

  const remove = useCallback(
    (id: string) =>
      run(async () => {
        await todosApi.remove(id);
        return todos.filter((t) => t.id !== id);
      }),
    [run, todos],
  );

  const clearCompleted = useCallback(
    () =>
      run(async () => {
        const done = todos.filter((t) => t.completed);
        await Promise.all(done.map((t) => todosApi.remove(t.id)));
        return todos.filter((t) => !t.completed);
      }),
    [run, todos],
  );

  return {
    todos,
    loading,
    error,
    add,
    update,
    toggle,
    remove,
    clearCompleted,
    reload,
  };
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message.includes("fetch")
      ? "Couldn't reach the api — is it running on :3001?"
      : err.message;
  }
  return String(err);
}
