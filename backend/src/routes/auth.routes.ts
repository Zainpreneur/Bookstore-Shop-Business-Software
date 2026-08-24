import { Router } from "express";
import bcrypt from "bcryptjs";
import { body } from "express-validator";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";

const router = Router();

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  address: string | null;
  phone: string | null;
  createdAt: Date;
}) {
  const { id, name, email, role, address, phone, createdAt } = user;
  return { id, name, email, role, address, phone, createdAt };
}

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, password, address, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, address, phone },
    });

    const token = signToken({ userId: user.id, role: user.role });
    res.status(201).json({ token, user: toPublicUser(user) });
  })
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = signToken({ userId: user.id, role: user.role });
    res.json({ token, user: toPublicUser(user) });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    res.json({ user: toPublicUser(user) });
  })
);

router.put(
  "/me",
  requireAuth,
  [
    body("name").optional().trim().notEmpty(),
    body("address").optional().trim(),
    body("phone").optional().trim(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, address, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, address, phone },
    });
    res.json({ user: toPublicUser(user) });
  })
);

export default router;
