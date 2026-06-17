import { Router, type Response } from "express";
import { API_ROUTES, type ApiResponse, type CreateTodoInput, type Todo as TodoContract, type TodoPriority, type UpdateTodoInput } from "@sdet/shared";
import { AppDataSource } from "../data-source.js";
import { Todo } from "../entities/Todo.js";

/**
 * CRUD over the `todos` table (see {@link Todo}), backed by better-sqlite3.
 * Every change is persisted, so todos survive restarts. On a fresh database
 * the table is seeded once with a few demo items — see {@link seedTodos}.
 */
export const todosRouter = Router();

/** The todos repository, resolved lazily so it's ready after DataSource init. */
const todoRepo = () => AppDataSource.getRepository(Todo);

const PRIORITIES: readonly TodoPriority[] = ["low", "medium", "high"];
const isPriority = (value: unknown): value is TodoPriority => typeof value === "string" && PRIORITIES.includes(value as TodoPriority);

const itemRoute = `${API_ROUTES.todos}/:id`;

/** GET /api/todos — newest first. */
todosRouter.get(API_ROUTES.todos, async (_req, res) => {
  const todos = await todoRepo().find({ order: { createdAt: "DESC" } });
  const body: ApiResponse<TodoContract[]> = { data: todos.map((t) => t.toContract()) };
  res.json(body);
});

/** POST /api/todos — create a todo from a {@link CreateTodoInput}. */
todosRouter.post(API_ROUTES.todos, async (req, res) => {
  const input = req.body as Partial<CreateTodoInput>;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (!title) {
    return fail(res, 400, "A todo needs a title.");
  }
  if (input.priority !== undefined && !isPriority(input.priority)) {
    return fail(res, 400, "Invalid priority.");
  }

  const repo = todoRepo();
  const todo = await repo.save(
    repo.create({
      title,
      notes: typeof input.notes === "string" && input.notes.trim() ? input.notes.trim() : null,
      completed: false,
      priority: input.priority ?? "medium",
    }),
  );

  const body: ApiResponse<TodoContract> = { data: todo.toContract() };
  res.status(201).json(body);
});

/** PATCH /api/todos/:id — apply a partial {@link UpdateTodoInput}. */
todosRouter.patch(itemRoute, async (req, res) => {
  const repo = todoRepo();
  const todo = await repo.findOne({ where: { id: req.params.id } });
  if (!todo) {
    return fail(res, 404, "No todo with that id.");
  }

  const patch = req.body as UpdateTodoInput;
  if (patch.title !== undefined) {
    const title = typeof patch.title === "string" ? patch.title.trim() : "";
    if (!title) {
      return fail(res, 400, "A todo needs a title.");
    }
    todo.title = title;
  }
  if (patch.notes !== undefined) {
    todo.notes = typeof patch.notes === "string" && patch.notes.trim() ? patch.notes.trim() : null;
  }
  if (patch.completed !== undefined) {
    todo.completed = Boolean(patch.completed);
  }
  if (patch.priority !== undefined) {
    if (!isPriority(patch.priority)) {
      return fail(res, 400, "Invalid priority.");
    }
    todo.priority = patch.priority;
  }

  const saved = await repo.save(todo);
  const body: ApiResponse<TodoContract> = { data: saved.toContract() };
  res.json(body);
});

/** DELETE /api/todos/:id — remove a todo. */
todosRouter.delete(itemRoute, async (req, res) => {
  const repo = todoRepo();
  const todo = await repo.findOne({ where: { id: req.params.id } });
  if (!todo) {
    return fail(res, 404, "No todo with that id.");
  }
  // Serialize before removing — `remove` clears the entity's primary key.
  const removed = todo.toContract();
  await repo.remove(todo);
  const body: ApiResponse<TodoContract> = { data: removed };
  res.json(body);
});

/** Send an {@link ApiResponse} error envelope with the given status. */
function fail(res: Response, status: number, error: string) {
  const body: ApiResponse<null> = { data: null, error };
  res.status(status).json(body);
}

/**
 * Seed the `todos` table with a few demo items, but only when it's empty, so
 * a fresh database has something to show. A no-op once any todos exist. Called
 * from `index.ts` after the DataSource is initialized.
 */
export async function seedTodos(): Promise<void> {
  const repo = todoRepo();
  if ((await repo.count()) > 0) {
    return;
  }
  await repo.save(
    repo.create([
      {
        title: "Sketch the new landing page",
        notes: "Lean into the hand-drawn vibe — wobbly everything.",
        completed: false,
        priority: "high",
      },
      {
        title: "Buy more sticky notes",
        notes: null,
        completed: false,
        priority: "low",
      },
      {
        title: "Water the office plant",
        notes: null,
        completed: true,
        priority: "medium",
      },
    ]),
  );
}
