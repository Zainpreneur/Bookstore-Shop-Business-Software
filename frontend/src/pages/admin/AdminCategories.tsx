import { type FormEvent, useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import type { Category } from "../../types";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function load() {
    api.get("/categories").then((res) => setCategories(res.data.categories));
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name });
      } else {
        await api.post("/categories", { name });
      }
      setName("");
      setEditingId(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    setError("");
    try {
      await api.delete(`/categories/${cat.id}`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl font-bold text-stone-900">Categories</h1>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          {editingId ? "Save" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setName("");
            }}
            className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-700"
          >
            Cancel
          </button>
        )}
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <ul className="mt-6 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-stone-800">
              {cat.name} <span className="text-stone-400">({cat._count?.books ?? 0} books)</span>
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingId(cat.id);
                  setName(cat.name);
                }}
                className="text-brand-700 hover:underline"
              >
                Edit
              </button>
              <button onClick={() => handleDelete(cat)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
