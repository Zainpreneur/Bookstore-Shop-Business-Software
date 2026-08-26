import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import type { Book, Review } from "../types";
import { formatDate, formatPrice } from "../utils/format";
import BookCover from "../components/BookCover";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState("");

  function loadReviews() {
    if (!id) return;
    api.get(`/reviews/book/${id}`).then((res) => {
      setReviews(res.data.reviews);
      setAvgRating(res.data.avgRating);
    });
  }

  useEffect(() => {
    if (!id) return;
    api.get(`/books/${id}`).then((res) => setBook(res.data.book));
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAddToCart() {
    setError("");
    setNotice("");
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await addToCart(book!.id, quantity);
      setNotice("Added to cart!");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function submitReview(e: FormEvent) {
    e.preventDefault();
    setReviewError("");
    try {
      await api.post(`/reviews/book/${id}`, { rating, comment });
      setComment("");
      setRating(5);
      loadReviews();
    } catch (err) {
      setReviewError(getErrorMessage(err));
    }
  }

  if (!book) return <p className="text-stone-500">Loading...</p>;

  return (
    <div>
      <Link to="/shop" className="text-sm text-brand-700 hover:underline">
        ← Back to shop
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-10 md:grid-cols-[300px_1fr]">
        <BookCover title={book.title} coverImage={book.coverImage} className="h-96 w-full rounded-lg shadow" />

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">{book.category.name}</span>
          <h1 className="mt-1 font-serif text-3xl font-bold text-stone-900">{book.title}</h1>
          <p className="mt-1 text-stone-600">
            by <span className="font-medium">{book.author.name}</span>
          </p>

          <div className="mt-2 flex items-center gap-2">
            <StarRating rating={avgRating} />
            <span className="text-sm text-stone-500">
              {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
            </span>
          </div>

          <p className="mt-4 text-2xl font-bold text-stone-900">{formatPrice(book.price)}</p>

          <p className="mt-4 leading-relaxed text-stone-700">{book.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-stone-600 sm:max-w-md">
            <dt className="font-medium">ISBN</dt>
            <dd>{book.isbn}</dd>
            <dt className="font-medium">Publisher</dt>
            <dd>{book.publisher || "—"}</dd>
            <dt className="font-medium">Published</dt>
            <dd>{book.publishedYear || "—"}</dd>
            <dt className="font-medium">Pages</dt>
            <dd>{book.pages || "—"}</dd>
            <dt className="font-medium">Language</dt>
            <dd>{book.language}</dd>
            <dt className="font-medium">Availability</dt>
            <dd>{book.stock > 0 ? `${book.stock} in stock` : "Out of stock"}</dd>
          </dl>

          <div className="mt-6 flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={Math.max(book.stock, 1)}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              disabled={book.stock === 0}
              className="w-20 rounded-md border border-stone-300 px-3 py-2 text-sm disabled:bg-stone-100"
            />
            <button
              onClick={handleAddToCart}
              disabled={book.stock === 0}
              className="rounded-md bg-brand-600 px-6 py-2 font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {book.stock === 0 ? "Out of stock" : "Add to cart"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {notice && <p className="mt-2 text-sm text-emerald-600">{notice}</p>}
        </div>
      </div>

      <section className="mt-16 max-w-2xl">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Reviews</h2>

        {user && (
          <form onSubmit={submitReview} className="mt-4 rounded-lg border border-stone-200 bg-white p-4">
            <p className="mb-2 text-sm font-medium text-stone-700">Leave a review</p>
            <div className="flex items-center gap-2">
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value, 10))}
                className="rounded-md border border-stone-300 px-2 py-1 text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of this book?"
              rows={3}
              className="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            />
            {reviewError && <p className="mt-1 text-sm text-red-600">{reviewError}</p>}
            <button
              type="submit"
              className="mt-2 rounded-md bg-stone-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-stone-700"
            >
              Submit review
            </button>
            <p className="mt-1 text-xs text-stone-400">Only customers who purchased this book can review it.</p>
          </form>
        )}

        <div className="mt-6 space-y-4">
          {reviews.length === 0 && <p className="text-stone-500">No reviews yet.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-stone-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-stone-800">{r.user.name}</span>
                <span className="text-xs text-stone-400">{formatDate(r.createdAt)}</span>
              </div>
              <StarRating rating={r.rating} />
              {r.comment && <p className="mt-1 text-sm text-stone-600">{r.comment}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
