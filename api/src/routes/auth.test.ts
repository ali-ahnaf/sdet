import "reflect-metadata";
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// Mock modules before importing the router so the router picks up the stubs.
vi.mock("../data-source.js", () => ({
  AppDataSource: {
    getRepository: vi.fn(),
  },
}));

vi.mock("../auth/tokens.js", () => ({
  signAuthToken: vi.fn(() => "test-jwt-token"),
}));

import { AppDataSource } from "../data-source.js";
import { authRouter } from "./auth.js";

const app = express();
app.use(express.json());
app.use(authRouter);

const mockRepo = {
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(AppDataSource.getRepository).mockReturnValue(mockRepo as any);
});

describe("POST /api/auth/signup", () => {
  it("returns 201 with a token and user profile on valid input", async () => {
    mockRepo.findOne.mockResolvedValue(null); // email not taken
    mockRepo.create.mockReturnValue({ name: "Alice", email: "alice@example.com", passwordHash: "x" });
    mockRepo.save.mockResolvedValue({
      id: "uuid-1",
      name: "Alice",
      email: "alice@example.com",
      toPublicUser: () => ({ id: "uuid-1", name: "Alice", email: "alice@example.com" }),
    });

    const res = await request(app).post("/api/auth/signup").send({
      name: "Alice",
      email: "alice@example.com",
      password: "securepass123",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.token).toBe("test-jwt-token");
    expect(res.body.data.user).toEqual({ id: "uuid-1", name: "Alice", email: "alice@example.com" });
  });

  it("returns 409 when the email is already registered", async () => {
    mockRepo.findOne.mockResolvedValue({ id: "existing-id", email: "alice@example.com" });

    const res = await request(app).post("/api/auth/signup").send({
      name: "Alice",
      email: "alice@example.com",
      password: "securepass123",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("An account with that email already exists.");
  });
});
