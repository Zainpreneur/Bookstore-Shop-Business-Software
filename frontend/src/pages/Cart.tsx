import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/format";
import BookCover from "../components/BookCover";

export default function Cart() {
  const { items, total, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="py-16 text-center">
        <p className="text-stone-600">Sign in to view your cart.</p>
        <Link to="/login" className="mt-4 inline-block rounded-md bg-brand-600 px-5 py-2 text-white">
          Sign in
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-stone-600">Your cart is empty.</p>
        <Link to="/shop" className="mt-4 inline-block rounded-md bg-brand-600 px-5 py-2 text-white">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-stone-900">Your cart</h1>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-4">
              <BookCover title={item.book.title} coverImage={item.book.coverImage} className="h-24 w-16 shrink-0 rounded" />
              <div className="flex-1">
                <Link to={`/books/${item.book.id}`} className="font-medium text-stone-900 hover:text-brand-700">
                  {item.book.title}
                </Link>
                <p className="text-sm text-stone-500">{item.book.author.name}</p>
                <p className="mt-1 text-sm font-semibold text-stone-800">{formatPrice(item.book.price)}</p>
              </div>
              <input
                type="number"
                min={1}
                max={item.book.stock}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.bookId, Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-16 rounded-md border border-stone-300 px-2 py-1 text-sm"
              />
              <span className="w-20 text-right font-semibold">{formatPrice(item.quantity * item.book.price)}</span>
              <button
                onClick={() => removeFromCart(item.bookId)}
                className="text-stone-400 hover:text-red-600"
                aria-label="Remove item"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-lg border border-stone-200 bg-white p-6">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span className="font-semibold text-stone-900">{formatPrice(total)}</span>
          </div>
          <p className="mt-1 text-xs text-stone-400">Tax and shipping calculated at checkout.</p>
          <button
            onClick={() => navigate("/checkout")}
            className="mt-4 w-full rounded-md bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700"
          >
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  );
}
