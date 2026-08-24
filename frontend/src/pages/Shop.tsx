import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/client";
import type { Book, Category, Pagination } from "../types";
import BookCard from "../components/BookCard";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const search = params.get("search") || "";
  const categoryId = params.get("categoryId") || "";
  const sort = params.get("sort") || "newest";
  const page = params.get("page") || "1";

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/books", { params: { search, categoryId, sort, page, pageSize: 12 } })
      .then((res) => {
        setBooks(res.data.books);
        setPagination(res.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [search, categoryId, sort, page]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-stone-900">Shop all books</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select
          value={categoryId}
          onChange={(e) => updateParam("categoryId", e.target.value)}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="title">Title A–Z</option>
        </select>

        {search && (
          <span className="rounded-full bg-brand-100 px-3 py-1 text-sm text-brand-800">
            Search: "{search}"
            <button className="ml-2 font-bold" onClick={() => updateParam("search", "")}>
              ×
            </button>
          </span>
        )}
      </div>

      {loading ? (
        <p className="mt-10 text-stone-500">Loading...</p>
      ) : books.length === 0 ? (
        <p className="mt-10 text-stone-500">No books match your search.</p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam("page", String(p))}
                  className={`h-9 w-9 rounded-md text-sm font-medium ${
                    p === pagination.page ? "bg-brand-600 text-white" : "border border-stone-300 text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
