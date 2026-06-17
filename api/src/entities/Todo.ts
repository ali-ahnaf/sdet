import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { Todo as TodoContract, TodoPriority } from "@sdet/shared";

/**
 * A todo item, persisted in the `todos` table.
 *
 * Columns line up with the shared {@link TodoContract}; timestamps are stored
 * as datetimes and serialized to ISO-8601 by {@link toContract}.
 */
@Entity("todos")
export class Todo {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "varchar", nullable: true })
  notes!: string | null;

  @Column({ type: "boolean", default: false })
  completed!: boolean;

  @Column({ type: "varchar", default: "medium" })
  priority!: TodoPriority;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  /** Serialize to the shared {@link TodoContract} exchanged with the client. */
  toContract(): TodoContract {
    return {
      id: this.id,
      title: this.title,
      notes: this.notes ?? undefined,
      completed: this.completed,
      priority: this.priority,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
