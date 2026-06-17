import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Tag } from "../components/Tag";
import { Squiggle, Blob, Arrow } from "../components/decorations";
import { colors } from "../theme";
import { useTodos, type TodoFilter } from "./useTodos";
import { TodoForm } from "./TodoForm";
import { TodoList } from "./TodoList";

const FILTERS: { id: TodoFilter; label: string }[] = [
  { id: "all", label: "all" },
  { id: "active", label: "to do" },
  { id: "completed", label: "done" },
];

const EMPTY_MESSAGE: Record<TodoFilter, string> = {
  all: "Nothing here yet — jot down your first task!",
  active: "All done. Go take a break! ☕",
  completed: "Nothing crossed off yet. You've got this!",
};

/** The whole todo board: header, add form, filters, list and footer. */
export function TodoApp() {
  const { todos, loading, error, add, update, toggle, remove, clearCompleted } =
    useTodos();
  const [filter, setFilter] = useState<TodoFilter>("all");

  const remaining = todos.filter((t) => !t.completed).length;
  const completed = todos.length - remaining;

  const visible = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  return (
    <main style={pageStyle}>
      <header style={{ position: "relative", textAlign: "center", marginBottom: "1.5rem" }}>
        <Tag background={colors.postit} color={colors.fg} tilt="-3deg">
          my sketchpad
        </Tag>
        <h1 style={titleStyle}>
          Things To Do
          <span style={{ color: colors.accent, display: "inline-block", transform: "rotate(8deg)" }}>
            !
          </span>
        </h1>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Squiggle width={240} />
        </div>
        <p style={subtitleStyle}>
          A scrappy little list for big ideas. Scribble, check, repeat.
        </p>

        {/* Desktop-only doodle bouncing beside the title */}
        <Blob
          size={54}
          className="hd-desktop-only"
          style={{ position: "absolute", top: -8, right: 0 }}
        />
      </header>

      <div style={{ position: "relative" }}>
        {/* Hand-drawn arrow pointing at the input, desktop only */}
        <Arrow
          className="hd-desktop-only"
          style={arrowStyle}
        />

        <Card decoration="tack" tilt="-1deg" style={{ padding: "1.5rem", overflow: "visible" }}>
          <TodoForm onAdd={add} />

          <div style={dividerStyle} aria-hidden="true" />

          <div style={toolbarStyle}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }} role="tablist" aria-label="Filter todos">
              {FILTERS.map((f) => (
                <FilterTab
                  key={f.id}
                  label={f.label}
                  selected={filter === f.id}
                  onClick={() => setFilter(f.id)}
                />
              ))}
            </div>
            <span style={countStyle} aria-live="polite">
              {remaining} left {completed > 0 && `· ${completed} done`}
            </span>
          </div>

          <div style={{ marginTop: "1.25rem" }}>
            {loading ? (
              <p style={{ textAlign: "center", color: "rgba(45,45,45,0.6)" }}>
                Sharpening pencils…
              </p>
            ) : error ? (
              <p style={errorStyle} role="alert">
                {error}
              </p>
            ) : (
              <TodoList
                todos={visible}
                emptyMessage={EMPTY_MESSAGE[filter]}
                onToggle={toggle}
                onUpdate={update}
                onRemove={remove}
              />
            )}
          </div>
        </Card>
      </div>

      {completed > 0 && (
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Button variant="secondary" onClick={clearCompleted}>
            Clear {completed} done
          </Button>
        </div>
      )}

      <footer style={footerStyle}>
        <span>made by hand · backed by a real api</span>
      </footer>
    </main>
  );
}

function FilterTab({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  const style: CSSProperties = {
    fontFamily: "var(--hd-font-body)",
    fontSize: "1rem",
    cursor: "pointer",
    padding: "0.3rem 0.95rem",
    color: selected ? "#fff" : "var(--hd-fg)",
    background: selected ? "var(--hd-fg)" : "transparent",
    border: "2px solid var(--hd-fg)",
    borderRadius: "120px 14px 120px 16px / 14px 120px 16px 120px",
    transform: selected ? "rotate(-2deg)" : "none",
    transition: "transform 100ms ease, background-color 100ms ease, color 100ms ease",
  };
  return (
    <button type="button" role="tab" aria-selected={selected} onClick={onClick} style={style}>
      {label}
    </button>
  );
}

const pageStyle: CSSProperties = {
  maxWidth: 680,
  margin: "0 auto",
  padding: "3.5rem 1.25rem 2.5rem",
};

const titleStyle: CSSProperties = {
  fontSize: "clamp(2.75rem, 8vw, 4rem)",
  margin: "0.5rem 0 0.25rem",
};

const subtitleStyle: CSSProperties = {
  margin: "0.75rem 0 0",
  fontSize: "1.15rem",
  color: "rgba(45,45,45,0.7)",
};

const dividerStyle: CSSProperties = {
  height: 0,
  borderTop: "2px dashed rgba(45,45,45,0.3)",
  margin: "1.25rem 0",
};

const toolbarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  flexWrap: "wrap",
};

const countStyle: CSSProperties = {
  fontSize: "1rem",
  color: "rgba(45,45,45,0.65)",
};

const errorStyle: CSSProperties = {
  textAlign: "center",
  color: colors.accent,
  border: "2px dashed var(--hd-accent)",
  borderRadius: "var(--hd-wobbly)",
  padding: "1rem",
};

const arrowStyle: CSSProperties = {
  position: "absolute",
  top: -54,
  right: 8,
  transform: "scaleX(-1) rotate(8deg)",
  zIndex: 2,
};

const footerStyle: CSSProperties = {
  textAlign: "center",
  marginTop: "2.5rem",
  fontSize: "0.95rem",
  color: "rgba(45,45,45,0.5)",
};
