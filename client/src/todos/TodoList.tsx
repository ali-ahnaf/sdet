import type { Todo, UpdateTodoInput } from "@sdet/shared";
import { TodoItem } from "./TodoItem";
import { tiltFor } from "../theme";

interface TodoListProps {
  todos: Todo[];
  emptyMessage: string;
  onToggle: (id: string) => void;
  onUpdate: (id: string, patch: UpdateTodoInput) => void;
  onRemove: (id: string) => void;
}

/** Stack of todo cards with alternating tilt; shows a friendly empty state. */
export function TodoList({
  todos,
  emptyMessage,
  onToggle,
  onUpdate,
  onRemove,
}: TodoListProps) {
  if (todos.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "grid",
        gap: "1rem",
      }}
    >
      {todos.map((todo, index) => (
        <li key={todo.id}>
          <TodoItem
            todo={todo}
            tilt={tiltFor(index)}
            // pin the very first card so the list reads like a note board
            decoration={index === 0 ? "tape" : "none"}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "2.5rem 1rem",
        border: "2px dashed rgba(45,45,45,0.35)",
        borderRadius: "var(--hd-wobbly)",
        color: "rgba(45,45,45,0.6)",
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }} aria-hidden="true">
        ✎
      </div>
      <p style={{ margin: 0, fontSize: "1.2rem" }}>{message}</p>
    </div>
  );
}
