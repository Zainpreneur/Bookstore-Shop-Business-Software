import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    navigate(search.trim() ? `/shop?search=${encodeURIComponent(search.trim())}` : "/shop");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <Link to="/" className="font-serif text-2xl font-bold text-brand-700 shrink-0">
          📖 Pagebound
        </Link>

        <form onSubmit={handleSearch} className="order-3 w-full sm:order-none sm:flex-1 sm:max-w-md">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books, authors, ISBN..."
            className="w-full rounded-full border border-stone-300 px-4 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </form>

        <nav className="ml-auto flex items-center gap-4 text-sm font-medium">
          <Link to="/shop" className="text-stone-700 hover:text-brand-700">
            Shop
          </Link>
          {user?.role === "ADMIN" && (
            <Link to="/admin" className="text-stone-700 hover:text-brand-700">
              Admin
            </Link>
          )}
          {user && (
            <>
              <Link to="/orders" className="text-stone-700 hover:text-brand-700">
                My Orders
              </Link>
              <Link to="/profile" className="text-stone-700 hover:text-brand-700">
                Profile
              </Link>
            </>
          )}
          <Link to="/cart" className="relative text-stone-700 hover:text-brand-700">
            🛒 Cart
            {count > 0 && (
              <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-stone-500 sm:inline">Hi, {user.name.split(" ")[0]}</span>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="rounded-md border border-stone-300 px-3 py-1 text-stone-700 hover:bg-stone-100"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
