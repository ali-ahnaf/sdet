import "reflect-metadata";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { DataSource } from "typeorm";
import { User } from "./entities/User.js";
import { Todo } from "./entities/Todo.js";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * The application's TypeORM DataSource, backed by better-sqlite3.
 *
 * Used both at runtime (initialized on server boot — see `index.ts`) and by the
 * TypeORM CLI for generating and running migrations. The schema is owned by the
 * migration files in `./migrations`; `synchronize` stays off so the DB only
 * ever changes through a reviewed migration.
 *
 * The migrations glob is resolved relative to this module so it matches the
 * `.ts` sources under `tsx`/the CLI and the compiled `.js` under `node dist`.
 */
export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: process.env.DATABASE_PATH ?? "app.sqlite",
  entities: [User, Todo],
  migrations: [join(here, "migrations", "*.{ts,js}")],
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === "true",
});
