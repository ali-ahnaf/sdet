import { Router } from "express";
import { API_ROUTES, type ApiResponse, type HealthStatus } from "@sdet/shared";

const startedAt = Date.now();

/** GET /api/health — liveness probe with process uptime. */
export const healthRouter = Router();

healthRouter.get(API_ROUTES.health, (_req, res) => {
  const body: ApiResponse<HealthStatus> = {
    data: {
      status: "ok",
      uptime: (Date.now() - startedAt) / 1000,
      timestamp: new Date().toISOString(),
    },
  };
  res.json(body);
});
