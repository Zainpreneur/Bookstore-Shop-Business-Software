import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

const TAX_RATE = 0.08;
const FLAT_SHIPPING_FEE = 4.99;
const FREE_SHIPPING_THRESHOLD = 50;

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, refreshCart } = useCart();
  const navigate = useNavigate();

  const [shippingName, setShippingName] = useState(user?.name || "");
  const [shippingAddr, setShippingAddr] = useState(user?.address || "");
  const [shippingPhone, setShippingPhone] = useState(user?.phone || "");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Once an order is placed the cart empties, which would otherwise trip the
  // "empty cart" redirect below before navigation to the order page lands.
  const [placed, setPlaced] = useState(false);

  if (items.length === 0 && !placed) return <Navigate to="/cart" replace />;

  const tax = Math.round(total * TAX_RATE * 100) / 100;
  const shippingFee = total >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const grandTotal = Math.round((total + tax + shippingFee) * 100) / 100;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/orders", { shippingName, shippingAddr, shippingPhone, paymentMethod });
      setPlaced(true);
      await refreshCart();
      navigate(`/orders/${data.order.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-3xl font-bold text-stone-900">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-[1fr_280px]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-stone-200 bg-white p-6">
          <div>
            <label className="block text-sm font-medium text-stone-700">Full name</label>
            <input
              required
              value={shippingName}
              onChange={(e) => setShippingName(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Shipping address</label>
            <textarea
              required
              rows={3}
              value={shippingAddr}
              onChange={(e) => setShippingAddr(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Phone number</label>
            <input
              required
              value={shippingPhone}
              onChange={(e) => setShippingPhone(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">Payment method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
            >
              <option>Cash on Delivery</option>
              <option>Credit Card</option>
              <option>PayPal</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Placing order..." : `Place order — ${formatPrice(grandTotal)}`}
          </button>
        </form>

        <div className="h-fit rounded-lg border border-stone-200 bg-white p-6 text-sm">
          <h2 className="font-semibold text-stone-900">Order summary</h2>
          <ul className="mt-3 space-y-2 text-stone-600">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span className="line-clamp-1 pr-2">
                  {item.book.title} × {item.quantity}
                </span>
                <span>{formatPrice(item.quantity * item.book.price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-stone-200 pt-4">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Tax (8%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-bold text-stone-900">
              <span>Total</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
