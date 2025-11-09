/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

function BreadCrumb({ book, category }) {
  // Handle different data structures
  const categoryName = category?.name || category || 'all';
  const bookTitle = book?.title || "Book";
  
  return (
    <section className="mt-6 mb-4 flex justify-center">
      <div className="flex flex-wrap items-center gap-2 bg-blue-100 rounded-full px-4 py-2">
        <Link 
          to={`/books/${categoryName}`} 
          className="font-medium text-blue-700 hover:text-blue-900 transition-colors"
        >
          {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
        </Link>
        <span className="text-gray-500">/</span>
        <span className="font-medium text-gray-700 truncate max-w-[200px]">
          {bookTitle}
        </span>
      </div>
    </section>
  );
}

export default BreadCrumb;