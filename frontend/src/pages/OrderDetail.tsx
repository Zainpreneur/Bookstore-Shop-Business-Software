import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import type { Order } from "../types";
import { formatDate, formatPrice } from "../utils/format";
import OrderStatusBadge from "../components/OrderStatusBadge";
import BookCover from "../components/BookCover";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (id) api.get(`/orders/${id}`).then((res) => setOrder(res.data.order));
  }, [id]);

  if (!order) return <p className="text-stone-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/orders" className="text-sm text-brand-700 hover:underline">
        ← Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Order #{order.id.slice(-8).toUpperCase()}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-sm text-stone-500">Placed on {formatDate(order.createdAt)}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm">
          <h2 className="font-semibold text-stone-900">Shipping details</h2>
          <p className="mt-2 text-stone-600">{order.shippingName}</p>
          <p className="text-stone-600">{order.shippingAddr}</p>
          <p className="text-stone-600">{order.shippingPhone}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-4 text-sm">
          <h2 className="font-semibold text-stone-900">Payment</h2>
          <p className="mt-2 text-stone-600">{order.paymentMethod}</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-stone-200 bg-white">
        <ul className="divide-y divide-stone-200">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-4">
              <BookCover title={item.book.title} coverImage={item.book.coverImage} className="h-20 w-14 shrink-0 rounded" />
              <div className="flex-1">
                <Link to={`/books/${item.book.id}`} className="font-medium text-stone-900 hover:text-brand-700">
                  {item.book.title}
                </Link>
                <p className="text-sm text-stone-500">
                  {formatPrice(item.unitPrice)} × {item.quantity}
                </p>
              </div>
              <span className="font-semibold">{formatPrice(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-stone-200 p-4 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Tax</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Shipping</span>
            <span>{order.shippingFee === 0 ? "Free" : formatPrice(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-bold text-stone-900">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
