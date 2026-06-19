import { Router, type Response } from "express";
import { sendPrompt } from "../services/aiprompt.service.js";

export const aiRouter = Router();

function fail(res: Response, status: number, error: string) {
  res.status(status).json({ data: null, error });
}

aiRouter.post("/api/ai/prompt", async (req, res) => {
  const { input } = req.body as { input?: unknown; instructions?: unknown };

  if (typeof input !== "string" || !input.trim()) {
    return fail(res, 400, "Field 'input' is required and must be a non-empty string.");
  }

  const output = await sendPrompt(input.trim(), (response) => {
    console.log("[ai-response]", response);
  });
  res.json({ data: { output } });
});
