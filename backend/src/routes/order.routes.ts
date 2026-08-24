import { Router } from "express";
import { body } from "express-validator";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

const TAX_RATE = 0.08; // 8% flat sales tax
const FLAT_SHIPPING_FEE = 4.99;
const FREE_SHIPPING_THRESHOLD = 50;

const orderInclude = {
  items: { include: { book: { select: { id: true, title: true, coverImage: true, isbn: true } } } },
  user: { select: { id: true, name: true, email: true } },
} as const;

const VALID_STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

/** POST /api/orders — checkout: turns the caller's cart into an order. */
router.post(
  "/",
  requireAuth,
  [
    body("shippingName").trim().notEmpty().withMessage("Shipping name is required"),
    body("shippingAddr").trim().notEmpty().withMessage("Shipping address is required"),
    body("shippingPhone").trim().notEmpty().withMessage("Shipping phone is required"),
    body("paymentMethod").optional().trim().notEmpty(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { shippingName, shippingAddr, shippingPhone, paymentMethod } = req.body;
    const userId = req.user!.userId;

    const order = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({ where: { userId }, include: { book: true } });
      if (cartItems.length === 0) {
        throw new ApiError(400, "Your cart is empty");
      }

      for (const item of cartItems) {
        if (!item.book.active) {
          throw new ApiError(400, `"${item.book.title}" is no longer available`);
        }
        if (item.quantity > item.book.stock) {
          throw new ApiError(400, `Only ${item.book.stock} unit(s) of "${item.book.title}" in stock`);
        }
      }

      const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.book.price, 0);
      const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
      const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
      const total = Math.round((subtotal + tax + shippingFee) * 100) / 100;

      const created = await tx.order.create({
        data: {
          userId,
          subtotal,
          tax,
          shippingFee,
          total,
          shippingName,
          shippingAddr,
          shippingPhone,
          paymentMethod: paymentMethod || "Cash on Delivery",
          status: "PAID",
          items: {
            create: cartItems.map((item) => ({
              bookId: item.bookId,
              quantity: item.quantity,
              unitPrice: item.book.price,
            })),
          },
        },
        include: orderInclude,
      });

      for (const item of cartItems) {
        await tx.book.update({
          where: { id: item.bookId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId } });

      return created;
    });

    res.status(201).json({ order });
  })
);

/** GET /api/orders — the caller's own order history. */
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
    res.json({ orders });
  })
);

/** GET /api/orders/all — admin: every order in the system, optionally filtered by status. */
router.get(
  "/all",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.query as Record<string, string>;
    const orders = await prisma.order.findMany({
      where: status ? { status: status as (typeof VALID_STATUSES)[number] } : undefined,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
    res.json({ orders });
  })
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: orderInclude });
    if (!order) throw new ApiError(404, "Order not found");
    if (order.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
      throw new ApiError(403, "You do not have access to this order");
    }
    res.json({ order });
  })
);

router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  [body("status").isIn(VALID_STATUSES).withMessage(`status must be one of: ${VALID_STATUSES.join(", ")}`)],
  validate,
  asyncHandler(async (req, res) => {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
      include: orderInclude,
    });
    res.json({ order });
  })
);

export default router;
