import { Router } from "express";
import { body } from "express-validator";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { books: true } } },
    });
    res.json({ categories });
  })
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  [body("name").trim().notEmpty().withMessage("Name is required")],
  validate,
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name, slug: slugify(name) } });
    res.status(201).json({ category });
  })
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  [body("name").trim().notEmpty().withMessage("Name is required")],
  validate,
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, slug: slugify(name) },
    });
    res.json({ category });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const bookCount = await prisma.book.count({ where: { categoryId: req.params.id } });
    if (bookCount > 0) {
      throw new ApiError(400, "Cannot delete a category that still has books assigned to it");
    }
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

export default router;
