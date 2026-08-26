interface Props {
  title: string;
  coverImage?: string | null;
  className?: string;
}

/** Renders the book's cover image, or a generated placeholder with its title/initial. */
export default function BookCover({ title, coverImage, className = "" }: Props) {
  if (coverImage) {
    return <img src={coverImage} alt={title} className={`object-cover ${className}`} />;
  }
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-brand-200 to-brand-400 text-brand-900 font-serif font-bold p-2 text-center ${className}`}
    >
      <span className="line-clamp-4 text-sm">{title}</span>
    </div>
  );
}
