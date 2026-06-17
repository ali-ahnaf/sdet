import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import type { Todo, UpdateTodoInput } from "@sdet/shared";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Checkbox } from "../components/Checkbox";
import { Tag } from "../components/Tag";
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from "../components/icons";
import { priorityStyle } from "../theme";

interface TodoItemProps {
  todo: Todo;
  tilt: string;
  decoration?: "none" | "tape" | "tack";
  onToggle: (id: string) => void;
  onUpdate: (id: string, patch: UpdateTodoInput) => void;
  onRemove: (id: string) => void;
}

/** A single todo as a cut-paper card, with inline edit / toggle / delete. */
export function TodoItem({
  todo,
  tilt,
  decoration = "none",
  onToggle,
  onUpdate,
  onRemove,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const swatch = priorityStyle[todo.priority];

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const startEdit = () => {
    setDraft(todo.title);
    setEditing(true);
  };

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== todo.title) {
      onUpdate(todo.id, { title: trimmed });
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(todo.title);
    setEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  };

  return (
    <Card
      interactive={!editing}
      tilt={tilt}
      decoration={decoration}
      style={{ padding: "0.85rem 1rem" }}
    >
      <div style={rowStyle}>
        <Checkbox
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          label={todo.title}
        />

        {editing ? (
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={save}
            aria-label="Edit todo title"
            autoFocus
            maxLength={120}
          />
        ) : (
          <span style={titleStyle(todo.completed)}>{todo.title}</span>
        )}

        <div style={actionsStyle}>
          {editing ? (
            <>
              <IconButton label="Save" tone="accent2" onClick={save}>
                <CheckIcon size={20} />
              </IconButton>
              <IconButton label="Cancel" onClick={cancel}>
                <XIcon size={20} />
              </IconButton>
            </>
          ) : (
            <>
              <Tag background={swatch.background} color={swatch.color}>
                {swatch.label}
              </Tag>
              <IconButton label={`Edit "${todo.title}"`} onClick={startEdit}>
                <PencilIcon size={19} />
              </IconButton>
              <IconButton
                label={`Delete "${todo.title}"`}
                tone="accent"
                onClick={() => onRemove(todo.id)}
              >
                <TrashIcon size={19} />
              </IconButton>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Compact circular icon button used inside a todo row. Kept local because its
 * sizing/states differ from the page-level {@link Button}; hover tint is
 * applied with JS since these have per-instance tones.
 */
function IconButton({
  label,
  onClick,
  tone = "neutral",
  children,
}: {
  label: string;
  onClick: () => void;
  tone?: "neutral" | "accent" | "accent2";
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  const fill =
    tone === "accent"
      ? "var(--hd-accent)"
      : tone === "accent2"
        ? "var(--hd-accent-2)"
        : "var(--hd-fg)";

  const style: CSSProperties = {
    width: 38,
    height: 38,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    cursor: "pointer",
    color: hover ? "#fff" : "var(--hd-fg)",
    background: hover ? fill : "var(--hd-card)",
    border: "2px solid var(--hd-fg)",
    borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
    boxShadow: hover ? "1px 1px 0 0 var(--hd-fg)" : "2px 2px 0 0 var(--hd-fg)",
    transform: hover ? "translate(1px, 1px) rotate(-3deg)" : "none",
    transition: "all 100ms ease",
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={style}
    >
      {children}
    </button>
  );
}

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.85rem",
};

const actionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginLeft: "auto",
};

function titleStyle(completed: boolean): CSSProperties {
  return {
    flex: 1,
    minWidth: 0,
    fontSize: "1.2rem",
    wordBreak: "break-word",
    color: completed ? "rgba(45,45,45,0.45)" : "var(--hd-fg)",
    textDecoration: completed ? "line-through" : "none",
    textDecorationColor: "var(--hd-accent)",
    textDecorationThickness: "2px",
  };
}
