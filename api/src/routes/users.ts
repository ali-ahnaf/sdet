import { Router } from "express";
import { API_ROUTES, type ApiResponse, type User } from "@sdet/shared";

/** GET /api/users — list of users. */
export const usersRouter = Router();

usersRouter.get(API_ROUTES.users, (_req, res) => {
  const users: User[] = [
    { id: "1", name: "Ada Lovelace", email: "ada@example.com" },
    { id: "2", name: "Alan Turing", email: "alan@example.com" },
  ];
  const body: ApiResponse<User[]> = { data: users };
  res.json(body);
});
