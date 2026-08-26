import { Router } from "express";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();
router.use(requireAuth, requireAdmin);

/** GET /api/dashboard/stats — headline business metrics for the admin dashboard. */
router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [bookCount, userCount, orders, activeBooksForStockCheck, topBooksRaw, recentOrders] = await Promise.all([
      prisma.book.count({ where: { active: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.findMany({ select: { total: true, status: true, createdAt: true } }),
      // Field-to-field comparisons (stock <= lowStockAlert) aren't expressible in a
      // Prisma `where`, so pull the small active set and filter in JS.
      prisma.book.findMany({
        where: { active: true },
        select: { id: true, title: true, stock: true, lowStockAlert: true },
      }),
      prisma.orderItem.groupBy({
        by: ["bookId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.order.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const lowStockBooks = activeBooksForStockCheck
      .filter((b) => b.stock <= b.lowStockAlert)
      .slice(0, 10);

    const revenue = orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.total, 0);
    const orderCount = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

    const topBookIds = topBooksRaw.map((b) => b.bookId);
    const topBookDetails = await prisma.book.findMany({
      where: { id: { in: topBookIds } },
      select: { id: true, title: true, coverImage: true, price: true },
    });
    const topBooks = topBooksRaw.map((tb) => ({
      book: topBookDetails.find((b) => b.id === tb.bookId),
      totalSold: tb._sum.quantity ?? 0,
    }));

    res.json({
      totals: {
        revenue: Math.round(revenue * 100) / 100,
        orderCount,
        pendingOrders,
        bookCount,
        customerCount: userCount,
      },
      lowStockBooks,
      topBooks,
      recentOrders,
    });
  })
);

export default router;
