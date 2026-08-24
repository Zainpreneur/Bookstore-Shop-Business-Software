import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import type { Order } from "../types";
import { formatDate, formatPrice } from "../utils/format";
import OrderStatusBadge from "../components/OrderStatusBadge";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders")
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-stone-500">Loading...</p>;

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-stone-600">You haven't placed any orders yet.</p>
        <Link to="/shop" className="mt-4 inline-block rounded-md bg-brand-600 px-5 py-2 text-white">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-stone-900">My orders</h1>
      <div className="mt-6 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-stone-50"
          >
            <div>
              <p className="font-medium text-stone-900">Order #{order.id.slice(-8).toUpperCase()}</p>
              <p className="text-sm text-stone-500">
                {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} />
              <span className="font-semibold text-stone-900">{formatPrice(order.total)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
