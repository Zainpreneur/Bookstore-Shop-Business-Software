import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { formatDate, formatPrice } from "../../utils/format";
import OrderStatusBadge from "../../components/OrderStatusBadge";
import type { Order, OrderStatus } from "../../types";

interface Stats {
  totals: {
    revenue: number;
    orderCount: number;
    pendingOrders: number;
    bookCount: number;
    customerCount: number;
  };
  lowStockBooks: { id: string; title: string; stock: number; lowStockAlert: number }[];
  topBooks: { book: { id: string; title: string; price: number } | undefined; totalSold: number }[];
  recentOrders: (Order & { status: OrderStatus })[];
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-stone-900">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get("/dashboard/stats").then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p className="text-stone-500">Loading...</p>;

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl font-bold text-stone-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Revenue" value={formatPrice(stats.totals.revenue)} />
        <StatCard label="Orders" value={stats.totals.orderCount} />
        <StatCard label="Pending orders" value={stats.totals.pendingOrders} />
        <StatCard label="Active books" value={stats.totals.bookCount} />
        <StatCard label="Customers" value={stats.totals.customerCount} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="font-semibold text-stone-900">Low stock alerts</h2>
          {stats.lowStockBooks.length === 0 ? (
            <p className="mt-2 text-sm text-stone-500">Nothing low on stock.</p>
          ) : (
            <ul className="mt-2 divide-y divide-stone-100">
              {stats.lowStockBooks.map((b) => (
                <li key={b.id} className="flex items-center justify-between py-2 text-sm">
                  <Link to={`/admin/books/${b.id}/edit`} className="text-stone-700 hover:text-brand-700">
                    {b.title}
                  </Link>
                  <span className="font-semibold text-amber-600">{b.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="font-semibold text-stone-900">Top sellers</h2>
          {stats.topBooks.length === 0 ? (
            <p className="mt-2 text-sm text-stone-500">No sales yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-stone-100">
              {stats.topBooks.map((tb, i) => (
                <li key={tb.book?.id ?? i} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-stone-700">{tb.book?.title ?? "Unknown book"}</span>
                  <span className="font-semibold text-stone-900">{tb.totalSold} sold</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm text-brand-700 hover:underline">
            View all →
          </Link>
        </div>
        <ul className="mt-2 divide-y divide-stone-100">
          {stats.recentOrders.map((order) => (
            <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <span className="text-stone-700">
                #{order.id.slice(-8).toUpperCase()} — {order.user?.name}
              </span>
              <span className="text-stone-400">{formatDate(order.createdAt)}</span>
              <OrderStatusBadge status={order.status} />
              <span className="font-semibold text-stone-900">{formatPrice(order.total)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
