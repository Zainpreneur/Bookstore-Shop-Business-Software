import { Router } from "express";
import { Prisma } from "@prisma/client";
import { body } from "express-validator";
import prisma from "../utils/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";

const router = Router();

const bookInclude = {
  category: true,
  author: true,
  _count: { select: { reviews: true } },
} satisfies Prisma.BookInclude;

/**
 * GET /api/books
 * Public catalog browsing: search, filter by category/author, sort, paginate.
 * Admins (optionalAuth) may pass includeInactive=true to see disabled listings.
 */
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const {
      search,
      categoryId,
      authorId,
      minPrice,
      maxPrice,
      sort = "newest",
      page = "1",
      pageSize = "12",
      includeInactive,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 12));

    const where: Prisma.BookWhereInput = {};

    if (!(includeInactive === "true" && req.user?.role === "ADMIN")) {
      where.active = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { isbn: { contains: search } },
        { author: { name: { contains: search } } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
      };
    }

    const orderBy: Prisma.BookOrderByWithRelationInput =
      sort === "price_asc"
        ? { price: "asc" }
        : sort === "price_desc"
        ? { price: "desc" }
        : sort === "title"
        ? { title: "asc" }
        : { createdAt: "desc" };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: bookInclude,
        orderBy,
        skip: (pageNum - 1) * size,
        take: size,
      }),
      prisma.book.count({ where }),
    ]);

    res.json({
      books,
      pagination: { page: pageNum, pageSize: size, total, totalPages: Math.ceil(total / size) || 1 },
    });
  })
);

router.get(
  "/featured",
  asyncHandler(async (_req, res) => {
    const books = await prisma.book.findMany({
      where: { active: true, featured: true },
      include: bookInclude,
      take: 8,
      orderBy: { createdAt: "desc" },
    });
    res.json({ books });
  })
);

router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id },
      include: {
        ...bookInclude,
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!book || (!book.active && req.user?.role !== "ADMIN")) {
      throw new ApiError(404, "Book not found");
    }
    res.json({ book });
  })
);

const bookValidators = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("isbn").trim().notEmpty().withMessage("ISBN is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be zero or a positive integer"),
  body("categoryId").trim().notEmpty().withMessage("Category is required"),
  body("authorId").trim().notEmpty().withMessage("Author is required"),
];

router.post(
  "/",
  requireAuth,
  requireAdmin,
  bookValidators,
  validate,
  asyncHandler(async (req, res) => {
    const {
      title,
      isbn,
      description,
      price,
      costPrice,
      stock,
      lowStockAlert,
      coverImage,
      publisher,
      publishedYear,
      language,
      pages,
      featured,
      categoryId,
      authorId,
    } = req.body;

    const book = await prisma.book.create({
      data: {
        title,
        isbn,
        description,
        price,
        costPrice: costPrice ?? 0,
        stock,
        lowStockAlert: lowStockAlert ?? 5,
        coverImage,
        publisher,
        publishedYear,
        language: language ?? "English",
        pages,
        featured: !!featured,
        categoryId,
        authorId,
      },
      include: bookInclude,
    });
    res.status(201).json({ book });
  })
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  bookValidators,
  validate,
  asyncHandler(async (req, res) => {
    const {
      title,
      isbn,
      description,
      price,
      costPrice,
      stock,
      lowStockAlert,
      coverImage,
      publisher,
      publishedYear,
      language,
      pages,
      featured,
      active,
      categoryId,
      authorId,
    } = req.body;

    const book = await prisma.book.update({
      where: { id: req.params.id },
      data: {
        title,
        isbn,
        description,
        price,
        costPrice,
        stock,
        lowStockAlert,
        coverImage,
        publisher,
        publishedYear,
        language,
        pages,
        featured: !!featured,
        active: active === undefined ? undefined : !!active,
        categoryId,
        authorId,
      },
      include: bookInclude,
    });
    res.json({ book });
  })
);

router.patch(
  "/:id/stock",
  requireAuth,
  requireAdmin,
  [body("stock").isInt({ min: 0 }).withMessage("Stock must be zero or a positive integer")],
  validate,
  asyncHandler(async (req, res) => {
    const book = await prisma.book.update({
      where: { id: req.params.id },
      data: { stock: req.body.stock },
      include: bookInclude,
    });
    res.json({ book });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    // Soft-delete: keep historical order data intact by deactivating instead
    // of hard-deleting a book that may be referenced by past orders.
    const orderItemCount = await prisma.orderItem.count({ where: { bookId: req.params.id } });
    if (orderItemCount > 0) {
      const book = await prisma.book.update({ where: { id: req.params.id }, data: { active: false } });
      return res.json({ book, message: "Book has existing orders; it was deactivated instead of deleted." });
    }
    await prisma.book.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

export default router;
