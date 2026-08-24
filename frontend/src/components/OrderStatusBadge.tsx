import type { OrderStatus } from "../types";

const STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-stone-100 text-stone-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}>{status}</span>
  );
}
