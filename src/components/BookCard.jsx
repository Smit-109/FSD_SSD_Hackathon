import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Edit } from "lucide-react";

/* eslint-disable react/prop-types */

// Random placeholder book cover images
const placeholderImages = [
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
];

// Get a consistent random image based on book ID
const getRandomPlaceholder = (bookId) => {
  if (!bookId) return placeholderImages[0];
  const index = bookId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % placeholderImages.length;
  return placeholderImages[index];
};

function BookCard({ book }) {
  const { isAdmin } = useAuth();
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
  
  // Handle both frontend mock data and backend API data structures
  const imageSrc = book?.imageSrc 
    ? (book.imageSrc.startsWith('http') ? book.imageSrc : `${baseUrl}${book.imageSrc}`)
    : getRandomPlaceholder(book?._id || book?.id);

  // Extract properties with fallbacks for different data structures
  const bookId = book?._id || book?.id;
  const title = book?.title;
  const author = book?.author?.primary || book?.author;
  const category = book?.category?.name || book?.category || 'all';
  const rating = book?.rating?.average || book?.rating || 0;

  return (
    <article className="flex flex-col items-center shadow-[2px_3px_5px_#777] p-3 rounded-lg w-[220px] relative">
      {/* Admin Edit Button */}
      {isAdmin && (
        <Link 
          to={`/books/edit/${bookId}`}
          className="absolute top-2 left-2 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 transition-colors z-10"
          title="Edit Book"
        >
          <Edit className="h-4 w-4" />
        </Link>
      )}
      
      <div className="relative">
        <img 
          src={imageSrc}
          alt={title || 'Book Image'}
          className="w-[220px] h-[270px] rounded-lg object-cover"
          onError={(e) => {
            console.log('Image failed to load:', e.target.src);
            e.target.onerror = null;
            e.target.src = getRandomPlaceholder(bookId);
          }}
        />
        {rating > 0 && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
            ⭐ {typeof rating === 'number' ? rating.toFixed(1) : rating}
          </div>
        )}
      </div>
      <h2 title={title} className="mt-2 font-semibold text-center h-[60px] flex items-center">
        {title?.length <= 25
          ? title
          : title?.slice(0, 25) + "..."}
      </h2>
      <h2 className="mt-2 font-semibold text-sm text-slate-500 h-[20px]">
        {author}
      </h2>
      <Link to={`/books/${category}/${bookId}`}>
        <button className="mt-4 text-[15px] bg-blue-900 text-white p-2 rounded-md hover:bg-blue-800 transition-colors">
          View Details
        </button>
      </Link>
    </article>
  );
}

export default BookCard;