export type Role = "CUSTOMER" | "ADMIN";

export type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  address: string | null;
  phone: string | null;
  createdAt: string;
  _count?: { orders: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { books: number };
}

export interface Author {
  id: string;
  name: string;
  bio: string | null;
  _count?: { books: number };
}

export interface Book {
  id: string;
  title: string;
  isbn: string;
  description: string;
  price: number;
  costPrice: number;
  stock: number;
  lowStockAlert: number;
  coverImage: string | null;
  publisher: string | null;
  publishedYear: number | null;
  language: string;
  pages: number | null;
  featured: boolean;
  active: boolean;
  createdAt: string;
  category: Category;
  author: Author;
  categoryId: string;
  authorId: string;
  _count?: { reviews: number };
  reviews?: Review[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userId: string;
  bookId: string;
  user: { id: string; name: string };
}

export interface CartItem {
  id: string;
  quantity: number;
  bookId: string;
  book: Book;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  bookId: string;
  book: { id: string; title: string; coverImage: string | null; isbn: string };
}

export interface Order {
  id: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  shippingName: string;
  shippingAddr: string;
  shippingPhone: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
  user?: { id: string; name: string; email: string };
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
