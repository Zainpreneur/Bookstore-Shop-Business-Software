interface Props {
  rating: number;
  size?: "sm" | "md";
}

export default function StarRating({ rating, size = "sm" }: Props) {
  const cls = size === "sm" ? "text-sm" : "text-lg";
  return (
    <span className={`text-amber-500 ${cls}`} aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n}>{n <= Math.round(rating) ? "★" : "☆"}</span>
      ))}
    </span>
  );
}
