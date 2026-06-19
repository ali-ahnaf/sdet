import "reflect-metadata";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source.js";
import { healthRouter } from "./routes/health.js";
import { usersRouter } from "./routes/users.js";
import { todosRouter, seedTodos } from "./routes/todos.js";
import { authRouter } from "./routes/auth.js";

const app = express();
const PORT = Number(process.env.PORT) || 3890;

// Built client assets live at client/dist, one level up from both api/src
// (dev via tsx) and api/dist (built via tsc), so the relative path is the same.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, "../../client/dist");

app.use(cors());
app.use(express.json());

app.get("/api/pid", (_req, res) => {
  res.json({ pid: process.pid });
});

app.use(healthRouter);
app.use(usersRouter);
app.use(todosRouter);
app.use(authRouter);

// Serve the built UI from the same server. Static files first, then an SPA
// fallback that returns index.html for any non-API route so client-side
// routing works on deep links / refreshes.
app.use(express.static(clientDist));
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

// Open the better-sqlite3 connection before accepting traffic, then start the
// server. Schema changes are applied via `npm run migration:run`, not here.
AppDataSource.initialize()
  .then(async () => {
    console.log("[api] data source initialized");
    await seedTodos();
    app.listen(PORT, () => {
      console.log(`[api] listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[api] failed to initialize data source", err);
    process.exit(1);
  });
