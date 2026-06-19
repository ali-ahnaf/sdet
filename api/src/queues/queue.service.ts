import { Queue, Worker, Job, QueueEvents } from "bullmq";
import OpenAI from "openai";
import { redisConnection } from "./connection.js";

export type JobName = "send-email" | "cleanup-todos" | "generate-report" | "ai-prompt";

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
}

export interface CleanupTodosPayload {
  userId: number;
  olderThanDays: number;
}

export interface GenerateReportPayload {
  userId: number;
  format: "csv" | "json";
}

export interface AiPromptPayload {
  input: string;
}

export type JobPayload =
  | { name: "send-email"; data: SendEmailPayload }
  | { name: "cleanup-todos"; data: CleanupTodosPayload }
  | { name: "generate-report"; data: GenerateReportPayload }
  | { name: "ai-prompt"; data: AiPromptPayload };

const QUEUE_NAME = "main";

class QueueService {
  private queue: Queue;
  private worker: Worker;
  private events: QueueEvents;
  private openai: OpenAI | null = null;

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      this.openai = new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });
    }
    return this.openai;
  }

  constructor() {
    this.queue = new Queue(QUEUE_NAME, { connection: redisConnection });

    this.worker = new Worker(
      QUEUE_NAME,
      async (job: Job) => this.process(job),
      { connection: redisConnection }
    );

    this.events = new QueueEvents(QUEUE_NAME, { connection: redisConnection });

    this.worker.on("completed", (job) => {
      console.log(`[queue] job ${job.id} (${job.name}) completed`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`[queue] job ${job?.id} (${job?.name}) failed:`, err.message);
    });
  }

  private async process(job: Job): Promise<unknown> {
    switch (job.name as JobName) {
      case "send-email": {
        const { to, subject } = job.data as SendEmailPayload;
        console.log(`[queue] sending email to ${to}: "${subject}"`);
        return { sent: true };
      }
      case "cleanup-todos": {
        const { userId, olderThanDays } = job.data as CleanupTodosPayload;
        console.log(`[queue] cleaning todos for user ${userId} older than ${olderThanDays} days`);
        return { cleaned: true };
      }
      case "generate-report": {
        const { userId, format } = job.data as GenerateReportPayload;
        console.log(`[queue] generating ${format} report for user ${userId}`);
        return { format, url: `/reports/${userId}-${Date.now()}.${format}` };
      }
      case "ai-prompt": {
        const { input } = job.data as AiPromptPayload;
        console.log(`[queue] processing ai-prompt`);
        const response = await this.getOpenAI().responses.create({
          model: "gpt-5.5",
          instructions: "You are a coding assistant that talks like a pirate",
          input,
        });
        return { output: response.output_text };
      }
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  async add<T extends JobPayload>(job: T, opts?: { delay?: number; attempts?: number }) {
    return this.queue.add(job.name, job.data, {
      delay: opts?.delay,
      attempts: opts?.attempts ?? 3,
      backoff: { type: "exponential", delay: 1000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    });
  }

  async getJob(id: string) {
    return this.queue.getJob(id);
  }

  async waitForJob(job: Job): Promise<unknown> {
    return job.waitUntilFinished(this.events);
  }

  async getQueueCounts() {
    return this.queue.getJobCounts("waiting", "active", "completed", "failed", "delayed");
  }

  async close() {
    await this.worker.close();
    await this.events.close();
    await this.queue.close();
  }
}

export const queueService = new QueueService();
