import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { User as PublicUser } from "@sdet/shared";

/**
 * A registered account, persisted in the `users` table.
 *
 * Mirrors the public {@link PublicUser} contract (id/name/email) and adds the
 * server-only `passwordHash` backing the auth routes. Use {@link toPublicUser}
 * to project the client-safe shape.
 */
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar", unique: true })
  email!: string;

  /** Salted scrypt hash as `"<saltHex>:<hashHex>"`. Never sent to clients. */
  @Column({ type: "varchar" })
  passwordHash!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  /** Project to the client-safe {@link PublicUser} shape, dropping secrets. */
  toPublicUser(): PublicUser {
    return { id: this.id, name: this.name, email: this.email };
  }
}
