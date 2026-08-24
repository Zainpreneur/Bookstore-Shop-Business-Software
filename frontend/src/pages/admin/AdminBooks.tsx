import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../../api/client";
import type { Book } from "../../types";
import { formatPrice } from "../../utils/format";

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api
      .get("/books", { params: { pageSize: 50, includeInactive: true } })
      .then((res) => setBooks(res.data.books))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleDelete(book: Book) {
    if (!confirm(`Delete "${book.title}"?`)) return;
    setError("");
    try {
      await api.delete(`/books/${book.id}`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-stone-900">Books</h1>
        <Link to="/admin/books/new" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          + Add book
        </Link>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="mt-6 text-stone-500">Loading...</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {books.map((book) => (
                <tr key={book.id}>
                  <td className="px-4 py-3 font-medium text-stone-900">{book.title}</td>
                  <td className="px-4 py-3 text-stone-600">{book.category.name}</td>
                  <td className="px-4 py-3 text-stone-600">{formatPrice(book.price)}</td>
                  <td className="px-4 py-3 text-stone-600">
                    <span className={book.stock <= book.lowStockAlert ? "font-semibold text-amber-600" : ""}>
                      {book.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        book.active ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {book.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/books/${book.id}/edit`} className="mr-3 text-brand-700 hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(book)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
