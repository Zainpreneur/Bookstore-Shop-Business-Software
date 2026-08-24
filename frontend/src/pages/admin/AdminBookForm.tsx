import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../../api/client";
import type { Author, Category } from "../../types";

interface FormState {
  title: string;
  isbn: string;
  description: string;
  price: string;
  costPrice: string;
  stock: string;
  lowStockAlert: string;
  coverImage: string;
  publisher: string;
  publishedYear: string;
  language: string;
  pages: string;
  featured: boolean;
  active: boolean;
  categoryId: string;
  authorId: string;
}

const EMPTY: FormState = {
  title: "",
  isbn: "",
  description: "",
  price: "",
  costPrice: "",
  stock: "",
  lowStockAlert: "5",
  coverImage: "",
  publisher: "",
  publishedYear: "",
  language: "English",
  pages: "",
  featured: false,
  active: true,
  categoryId: "",
  authorId: "",
};

export default function AdminBookForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    Promise.all([api.get("/categories"), api.get("/authors")]).then(([catRes, authRes]) => {
      setCategories(catRes.data.categories);
      setAuthors(authRes.data.authors);
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    api.get(`/books/${id}`).then((res) => {
      const b = res.data.book;
      setForm({
        title: b.title,
        isbn: b.isbn,
        description: b.description,
        price: String(b.price),
        costPrice: String(b.costPrice),
        stock: String(b.stock),
        lowStockAlert: String(b.lowStockAlert),
        coverImage: b.coverImage || "",
        publisher: b.publisher || "",
        publishedYear: b.publishedYear ? String(b.publishedYear) : "",
        language: b.language,
        pages: b.pages ? String(b.pages) : "",
        featured: b.featured,
        active: b.active,
        categoryId: b.categoryId,
        authorId: b.authorId,
      });
      setLoading(false);
    });
  }, [id]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      title: form.title,
      isbn: form.isbn,
      description: form.description,
      price: parseFloat(form.price),
      costPrice: form.costPrice ? parseFloat(form.costPrice) : 0,
      stock: parseInt(form.stock, 10),
      lowStockAlert: form.lowStockAlert ? parseInt(form.lowStockAlert, 10) : 5,
      coverImage: form.coverImage || undefined,
      publisher: form.publisher || undefined,
      publishedYear: form.publishedYear ? parseInt(form.publishedYear, 10) : undefined,
      language: form.language,
      pages: form.pages ? parseInt(form.pages, 10) : undefined,
      featured: form.featured,
      active: form.active,
      categoryId: form.categoryId,
      authorId: form.authorId,
    };

    try {
      if (isEdit) {
        await api.put(`/books/${id}`, payload);
      } else {
        await api.post("/books", payload);
      }
      navigate("/admin/books");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-stone-500">Loading...</p>;

  const inputCls = "mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm";
  const labelCls = "block text-sm font-medium text-stone-700";

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl font-bold text-stone-900">{isEdit ? "Edit book" : "Add a book"}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-lg border border-stone-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Title</label>
            <input required value={form.title} onChange={(e) => update("title", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>ISBN</label>
            <input required value={form.isbn} onChange={(e) => update("isbn", e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className={labelCls}>Price</label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Cost price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.costPrice}
              onChange={(e) => update("costPrice", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Stock</label>
            <input
              required
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Low stock alert</label>
            <input
              type="number"
              min="0"
              value={form.lowStockAlert}
              onChange={(e) => update("lowStockAlert", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Category</label>
            <select required value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)} className={inputCls}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Author</label>
            <select required value={form.authorId} onChange={(e) => update("authorId", e.target.value)} className={inputCls}>
              <option value="">Select an author</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Publisher</label>
            <input value={form.publisher} onChange={(e) => update("publisher", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Published year</label>
            <input
              type="number"
              value={form.publishedYear}
              onChange={(e) => update("publishedYear", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Pages</label>
            <input type="number" value={form.pages} onChange={(e) => update("pages", e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Cover image URL</label>
          <input value={form.coverImage} onChange={(e) => update("coverImage", e.target.value)} className={inputCls} />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
            Featured
          </label>
          {isEdit && (
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} />
              Active (visible in shop)
            </label>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Create book"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/books")}
            className="rounded-md border border-stone-300 px-5 py-2.5 font-semibold text-stone-700 hover:bg-stone-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
