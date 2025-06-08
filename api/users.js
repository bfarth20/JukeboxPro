import express from "express";
import bcrypt from "bcrypt";
import requireBody from "../middleware/requireBody.js";
import { createToken } from "../utils/jwt.js";
import { createUser, getUserByUsername } from "../db/queries/users.js";

const router = express.Router();

//POST /users/register
router.post(
  "/register",
  requireBody(["username", "password"]),
  async (req, res) => {
    const { username, password } = req.body;

    try {
      const existingUser = await getUserByUsername(username);
      if (existingUser) return res.status(400).send("Username already taken.");

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await createUser(username, hashedPassword);
      const token = createToken({ id: user.id });

      res.status(201).send(token);
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      res.status(500).send("Something went wrong.");
    }
  }
);

//POST /users/login
router.post(
  "/login",
  requireBody(["username", "password"]),
  async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await getUserByUsername(username);
      if (!user) return res.status(400).send("Invalid credentials.");

      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (!passwordsMatch) return res.status(400).send("Invalid credentials.");

      const token = createToken({ id: user.id });

      res.send(token);
    } catch (err) {
      console.error(err);
      res.status(500).send("Something went wrong.");
    }
  }
);

export default router;
