import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import type { Book, Category } from "../types";
import BookCard from "../components/BookCard";

export default function Home() {
  const [featured, setFeatured] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/books/featured"), api.get("/categories")])
      .then(([booksRes, catRes]) => {
        setFeatured(booksRes.data.books);
        setCategories(catRes.data.categories);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-16">
      <section className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 px-8 py-16 text-center text-white">
        <h1 className="font-serif text-4xl font-bold sm:text-5xl">Stories worth staying up for.</h1>
        <p className="mx-auto mt-4 max-w-xl text-brand-100">
          Curated fiction, non-fiction, and everything in between — hand-picked, always in stock, delivered to your door.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-block rounded-full bg-white px-6 py-2.5 font-semibold text-brand-800 hover:bg-brand-100"
        >
          Browse the shop
        </Link>
      </section>

      {categories.length > 0 && (
        <section>
          <h2 className="mb-4 font-serif text-2xl font-bold text-stone-900">Shop by category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?categoryId=${cat.id}`}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:border-brand-500 hover:text-brand-700"
              >
                {cat.name}
                {cat._count && <span className="ml-1 text-stone-400">({cat._count.books})</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-stone-900">Featured books</h2>
          <Link to="/shop" className="text-sm font-medium text-brand-700 hover:underline">
            View all →
          </Link>
        </div>
        {loading ? (
          <p className="text-stone-500">Loading...</p>
        ) : featured.length === 0 ? (
          <p className="text-stone-500">No featured books yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
