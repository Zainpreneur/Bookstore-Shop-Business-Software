import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-serif text-5xl font-bold text-stone-300">404</p>
      <p className="mt-2 text-stone-600">This page doesn't exist.</p>
      <Link to="/" className="mt-4 inline-block rounded-md bg-brand-600 px-5 py-2 text-white">
        Go home
      </Link>
    </div>
  );
}
