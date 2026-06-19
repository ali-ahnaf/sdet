import { queueService } from "../queues/queue.service.js";

export function sendPrompt(input: string, callback: (response: string) => void): void {
  queueService
    .add({ name: "ai-prompt", data: { input } })
    .then((job) => queueService.waitForJob(job))
    .then((result) => {
      const { output } = result as { output: string };
      console.log("[aiprompt] response:", output);
      // send sms to user
      callback(output);
    })
    .catch((err) => {
      console.error("[aiprompt] job failed:", err);
    });
}
