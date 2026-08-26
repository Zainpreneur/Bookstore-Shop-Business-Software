import { Router } from "express";
import { body } from "express-validator";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const authors = await prisma.author.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { books: true } } },
    });
    res.json({ authors });
  })
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  [body("name").trim().notEmpty().withMessage("Name is required")],
  validate,
  asyncHandler(async (req, res) => {
    const { name, bio } = req.body;
    const author = await prisma.author.create({ data: { name, bio } });
    res.status(201).json({ author });
  })
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  [body("name").trim().notEmpty().withMessage("Name is required")],
  validate,
  asyncHandler(async (req, res) => {
    const { name, bio } = req.body;
    const author = await prisma.author.update({ where: { id: req.params.id }, data: { name, bio } });
    res.json({ author });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const bookCount = await prisma.book.count({ where: { authorId: req.params.id } });
    if (bookCount > 0) {
      throw new ApiError(400, "Cannot delete an author that still has books assigned to them");
    }
    await prisma.author.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

export default router;
