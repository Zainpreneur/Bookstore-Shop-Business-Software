import { Router } from "express";
import { body } from "express-validator";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

router.get(
  "/book/:bookId",
  asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
      where: { bookId: req.params.bookId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    res.json({ reviews, avgRating, count: reviews.length });
  })
);

router.post(
  "/book/:bookId",
  requireAuth,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("rating must be between 1 and 5"),
    body("comment").optional().trim().isLength({ max: 2000 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    const { rating, comment } = req.body;

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new ApiError(404, "Book not found");

    // Only customers who actually purchased the book may leave a review.
    const purchased = await prisma.orderItem.findFirst({
      where: { bookId, order: { userId: req.user!.userId } },
    });
    if (!purchased) {
      throw new ApiError(403, "You can only review books you have purchased");
    }

    const review = await prisma.review.upsert({
      where: { userId_bookId: { userId: req.user!.userId, bookId } },
      update: { rating, comment },
      create: { userId: req.user!.userId, bookId, rating, comment },
      include: { user: { select: { id: true, name: true } } },
    });
    res.status(201).json({ review });
  })
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) throw new ApiError(404, "Review not found");
    if (review.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
      throw new ApiError(403, "You cannot delete this review");
    }
    await prisma.review.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

export default router;
