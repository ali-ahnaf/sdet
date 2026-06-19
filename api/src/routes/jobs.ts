import { Router } from "express";
import { queueService, JobPayload } from "../queues/queue.service.js";

export const jobsRouter = Router();

jobsRouter.post("/api/jobs", async (req, res) => {
  const job = req.body as JobPayload;

  if (!job?.name) {
    res.status(400).json({ error: "job.name is required" });
    return;
  }

  const queued = await queueService.add(job);
  res.status(202).json({ id: queued.id, name: queued.name });
});

jobsRouter.get("/api/jobs/:id", async (req, res) => {
  const job = await queueService.getJob(req.params.id);

  if (!job) {
    res.status(404).json({ error: "job not found" });
    return;
  }

  const state = await job.getState();
  res.json({ id: job.id, name: job.name, state, data: job.data, returnvalue: job.returnvalue });
});

jobsRouter.get("/api/jobs", async (_req, res) => {
  const counts = await queueService.getQueueCounts();
  res.json(counts);
});
