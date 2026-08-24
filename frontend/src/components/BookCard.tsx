import { Link } from "react-router-dom";
import type { Book } from "../types";
import { formatPrice } from "../utils/format";
import BookCover from "./BookCover";

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex flex-col rounded-lg border border-stone-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <BookCover title={book.title} coverImage={book.coverImage} className="h-56 w-full" />
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-brand-600">{book.category.name}</span>
        <h3 className="mt-1 font-serif font-semibold text-stone-900 line-clamp-2 group-hover:text-brand-700">
          {book.title}
        </h3>
        <p className="mt-1 text-sm text-stone-500">by {book.author.name}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-stone-900">{formatPrice(book.price)}</span>
          {book.stock === 0 ? (
            <span className="text-xs font-medium text-red-600">Out of stock</span>
          ) : book.stock <= book.lowStockAlert ? (
            <span className="text-xs font-medium text-amber-600">Low stock</span>
          ) : (
            <span className="text-xs font-medium text-emerald-600">In stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
