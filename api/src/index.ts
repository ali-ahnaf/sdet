import "reflect-metadata";
import path from "node:path";

// Load .env before anything reads process.env
process.loadEnvFile(new URL("../.env", import.meta.url));
import { fileURLToPath } from "node:url";
import os from "node:os";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source.js";
import { healthRouter } from "./routes/health.js";
import { usersRouter } from "./routes/users.js";
import { todosRouter, seedTodos } from "./routes/todos.js";
import { authRouter } from "./routes/auth.js";
import { aiRouter } from "./routes/ai.js";
import { jobsRouter } from "./routes/jobs.js";
import { queueService } from "./queues/queue.service.js";

const app = express();
const PORT = Number(process.env.PORT) || 3890;

// Built client assets live at client/dist, one level up from both api/src
// (dev via tsx) and api/dist (built via tsc), so the relative path is the same.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, "../../client/dist");

// Persists request counts per PID across calls within this process lifetime.
const requestCountByPid = new Map<number, number>();

app.use(cors());
app.use(express.json());

app.get("/api/pid", (_req, res) => {
  res.json({ pid: process.pid });
});

app.get("/api/whoami", (_req, res) => {
  const pid = process.pid;
  const count = (requestCountByPid.get(pid) ?? 0) + 1;
  requestCountByPid.set(pid, count);

  res.json({
    pid,
    port: process.env.PORT,
    hostname: os.hostname(),
    pm2_instance: process.env.NODE_APP_INSTANCE,
    uptime_seconds: Math.floor(process.uptime()),
    requests_handled: count,
    all_pid_counts: Object.fromEntries(requestCountByPid),
    memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/stats", (_req, res) => {
  res.json({ request_counts_by_pid: Object.fromEntries(requestCountByPid) });
});

app.use(healthRouter);
app.use(usersRouter);
app.use(todosRouter);
app.use(authRouter);
app.use(aiRouter);
app.use(jobsRouter);

const workerColors: Record<number, string> = { 0: "#ff6666", 1: "#66ff66", 2: "#6666ff", 3: "#ffff66" };
const workerCounts: Record<number, number> = {};

app.get("/api/lb-test", (_req, res) => {
  workerCounts[process.pid] = (workerCounts[process.pid] || 0) + 1;
  res.send(`
    <html>
      <body style="background:${workerColors[process.pid % 4]};font-size:60px;text-align:center;padding-top:100px">
        Worker PID: ${process.pid}
      </body>
    </html>
  `);
});

app.get("/api/lb-count", (_req, res) => {
  workerCounts[process.pid] = (workerCounts[process.pid] || 0) + 1;
  res.json({ pid: process.pid, requestsHandled: workerCounts[process.pid] });
});

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

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.once(sig, async () => {
    await queueService.close();
    process.exit(0);
  });
}
