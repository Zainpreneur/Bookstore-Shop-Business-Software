export default function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-stone-500">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-serif text-lg font-semibold text-brand-700">📖 Pagebound Books</p>
          <p>&copy; {new Date().getFullYear()} Pagebound Books. All rights reserved.</p>
        </div>
        <p className="mt-4 text-xs text-stone-400">
          Demo bookstore business software — catalog, cart, checkout, and an admin back office.
        </p>
      </div>
    </footer>
  );
}
