import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/books", label: "Books" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/authors", label: "Authors" },
  { to: "/admin/customers", label: "Customers" },
];

export default function AdminLayout() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
      <aside>
        <h2 className="mb-3 font-serif text-lg font-bold text-stone-900">Admin</h2>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-brand-600 text-white" : "text-stone-600 hover:bg-stone-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
