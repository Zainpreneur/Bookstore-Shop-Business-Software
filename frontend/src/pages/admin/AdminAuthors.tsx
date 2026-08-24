import { type FormEvent, useEffect, useState } from "react";
import api, { getErrorMessage } from "../../api/client";
import type { Author } from "../../types";

export default function AdminAuthors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function load() {
    api.get("/authors").then((res) => setAuthors(res.data.authors));
  }

  useEffect(load, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/authors/${editingId}`, { name, bio });
      } else {
        await api.post("/authors", { name, bio });
      }
      setName("");
      setBio("");
      setEditingId(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(author: Author) {
    if (!confirm(`Delete author "${author.name}"?`)) return;
    setError("");
    try {
      await api.delete(`/authors/${author.id}`);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl font-bold text-stone-900">Authors</h1>

      <form onSubmit={handleSubmit} className="mt-4 space-y-2 rounded-lg border border-stone-200 bg-white p-4">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Author name"
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Short bio (optional)"
          rows={2}
          className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <button type="submit" className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            {editingId ? "Save" : "Add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName("");
                setBio("");
              }}
              className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <ul className="mt-6 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {authors.map((author) => (
          <li key={author.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="text-stone-800">
              {author.name} <span className="text-stone-400">({author._count?.books ?? 0} books)</span>
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingId(author.id);
                  setName(author.name);
                  setBio(author.bio || "");
                }}
                className="text-brand-700 hover:underline"
              >
                Edit
              </button>
              <button onClick={() => handleDelete(author)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
