import { Link } from "react-router-dom";

/* eslint-disable react/prop-types */
function BookCard({ book }) {
  return (
    <article className="flex flex-col items-center shadow-[2px_3px_5px_#777] p-3 rounded-lg">
      <div className="relative">
        <img 
          src={
            book?.imageSrc
              ? `${import.meta.env.VITE_BASE_URL}${book.imageSrc}`
              : '/placeholder-book.jpg'
          }
          alt={book?.title || 'Book Image'}
          className="w-[220px] h-[270px] rounded-lg object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-book.jpg';
          }}
        />
        {book?.rating > 0 && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
            ⭐ {book.rating.toFixed(1)}
          </div>
        )}
      </div>
      <h2 title={book?.title} className="mt-2 font-semibold text-center">
        {book?.title?.length <= 25
          ? book?.title
          : book?.title?.slice(0, 25) + "..."}
      </h2>
      <h2 className="mt-2 font-semibold text-sm text-slate-500">
        {book?.author}
      </h2>
      <Link to={"/books/" + book?.category + "/" + book?._id}>
        <button className="mt-4 text-[15px] bg-blue-900 text-white p-2 rounded-md">
          View More Details
        </button>
      </Link>
    </article>
  );
}

export default BookCard;
