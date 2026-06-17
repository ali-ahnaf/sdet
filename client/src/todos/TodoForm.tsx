import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import type { CreateTodoInput, TodoPriority } from "@sdet/shared";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { PlusIcon } from "../components/icons";
import { priorityStyle } from "../theme";

interface TodoFormProps {
  onAdd: (input: CreateTodoInput) => void;
}

const PRIORITIES: TodoPriority[] = ["low", "medium", "high"];

/** Capture a new todo: a title plus a quick priority pick. */
export function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("medium");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAdd({ title: trimmed, priority });
    setTitle("");
    setPriority("medium");
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: "0.85rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "stretch" }}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          aria-label="New todo title"
          maxLength={120}
        />
        <Button type="submit" disabled={!title.trim()} style={{ whiteSpace: "nowrap" }}>
          <PlusIcon size={20} />
          Add
        </Button>
      </div>

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>priority</legend>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {PRIORITIES.map((p) => {
            const selected = p === priority;
            const swatch = priorityStyle[p];
            return (
              <button
                key={p}
                type="button"
                aria-pressed={selected}
                onClick={() => setPriority(p)}
                style={pillStyle(selected, swatch.background)}
              >
                {swatch.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </form>
  );
}

const fieldsetStyle: CSSProperties = {
  border: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
};

const legendStyle: CSSProperties = {
  float: "left",
  fontSize: "0.95rem",
  color: "rgba(45,45,45,0.6)",
  marginRight: "0.5rem",
};

function pillStyle(selected: boolean, swatch: string): CSSProperties {
  return {
    fontFamily: "var(--hd-font-body)",
    fontSize: "0.95rem",
    cursor: "pointer",
    padding: "0.25rem 0.85rem",
    color: "var(--hd-fg)",
    background: selected ? swatch : "var(--hd-card)",
    border: "2px solid var(--hd-fg)",
    borderRadius: "120px 12px 120px 14px / 12px 120px 14px 120px",
    boxShadow: selected ? "2px 2px 0 0 var(--hd-fg)" : "none",
    transform: selected ? "rotate(-2deg)" : "none",
    transition: "transform 100ms ease, box-shadow 100ms ease",
  };
}
