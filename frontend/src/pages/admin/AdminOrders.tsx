import { useEffect, useState } from "react";
import api from "../../api/client";
import type { Order, OrderStatus } from "../../types";
import { formatDate, formatPrice } from "../../utils/format";
import OrderStatusBadge from "../../components/OrderStatusBadge";

const STATUSES: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get("/orders/all", { params: filter ? { status: filter } : {} })
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  }

  useEffect(load, [filter]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    await api.patch(`/orders/${orderId}/status`, { status });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-stone-900">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-md border border-stone-300 px-3 py-1.5 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="mt-6 text-stone-500">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-stone-500">No orders found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium text-stone-900">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-stone-600">
                    {order.user?.name}
                    <div className="text-xs text-stone-400">{order.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 font-semibold text-stone-900">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                      className="rounded-md border border-stone-300 px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
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
