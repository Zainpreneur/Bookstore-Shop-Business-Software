import { Router } from "express";
import { body } from "express-validator";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();
router.use(requireAuth);

const cartInclude = {
  book: { include: { category: true, author: true } },
} as const;

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user!.userId },
      include: cartInclude,
      orderBy: { createdAt: "asc" },
    });
    const total = items.reduce((sum, item) => sum + item.quantity * item.book.price, 0);
    res.json({ items, total });
  })
);

router.post(
  "/",
  [
    body("bookId").trim().notEmpty().withMessage("bookId is required"),
    body("quantity").optional().isInt({ min: 1 }).withMessage("quantity must be a positive integer"),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { bookId, quantity = 1 } = req.body;

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book || !book.active) {
      throw new ApiError(404, "Book not found");
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_bookId: { userId: req.user!.userId, bookId } },
    });
    const desiredQty = (existing?.quantity ?? 0) + quantity;
    if (desiredQty > book.stock) {
      throw new ApiError(400, `Only ${book.stock} unit(s) of "${book.title}" in stock`);
    }

    const item = await prisma.cartItem.upsert({
      where: { userId_bookId: { userId: req.user!.userId, bookId } },
      update: { quantity: desiredQty },
      create: { userId: req.user!.userId, bookId, quantity },
      include: cartInclude,
    });
    res.status(201).json({ item });
  })
);

router.put(
  "/:bookId",
  [body("quantity").isInt({ min: 1 }).withMessage("quantity must be a positive integer")],
  validate,
  asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const book = await prisma.book.findUnique({ where: { id: req.params.bookId } });
    if (!book) throw new ApiError(404, "Book not found");
    if (quantity > book.stock) {
      throw new ApiError(400, `Only ${book.stock} unit(s) of "${book.title}" in stock`);
    }

    const item = await prisma.cartItem.update({
      where: { userId_bookId: { userId: req.user!.userId, bookId: req.params.bookId } },
      data: { quantity },
      include: cartInclude,
    });
    res.json({ item });
  })
);

router.delete(
  "/:bookId",
  asyncHandler(async (req, res) => {
    await prisma.cartItem.delete({
      where: { userId_bookId: { userId: req.user!.userId, bookId: req.params.bookId } },
    });
    res.status(204).send();
  })
);

router.delete(
  "/",
  asyncHandler(async (req, res) => {
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });
    res.status(204).send();
  })
);

export default router;
