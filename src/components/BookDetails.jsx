import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BreadCrumb from "./BreadCrumb";
import { useAuth } from "../contexts/AuthContext";
import { Edit, Trash2, BookOpen } from "lucide-react";
import PDFViewer from "./PDFViewer";

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

const getRandomPlaceholder = (bookId) => {
  if (!bookId) return placeholderImages[0];
  const index = bookId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % placeholderImages.length;
  return placeholderImages[index];
};

function BookDetails() {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const { bookId } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchBookById(`${baseUrl}/api/v1/books/book/${bookId}`);
  }, [bookId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  async function fetchBookById(url) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      const resJson = await res.json();
      if (resJson.success) {
        setBook(resJson.data);
      } else {
        setError("Book not found");
      }
    } catch (error) {
      setError("Failed to load book details");
      import("../utils/mockdata").then(({ books }) => {
        const foundBook = books.find(b => b.id == bookId || b._id == bookId);
        if (foundBook) setBook(foundBook);
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteBook() {
    if (!window.confirm("Are you sure you want to delete this book? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${baseUrl}/api/v1/books/delete/${bookId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      const response = await res.json();
      if (!response.success) throw new Error(response.message || 'Failed to delete book');
      navigate('/books/all');
    } catch (error) {
      alert(error.message || "Failed to delete book. Please try again.");
    }
  }

  function handleReadBook() {
    const pdfPath = book?.files?.pdfPath || book?.files?.pdfSrc || book?.files?.pdf || book?.pdf;
    if (!pdfPath) {
      alert("PDF file not available for this book.");
      return;
    }
    setShowPDFViewer(true);
  }

  function getPdfUrl() {
    const pdfPath = book?.files?.pdfPath || book?.files?.pdfSrc || book?.files?.pdf || book?.pdf;
    if (!pdfPath) return null;
    
    return pdfPath.startsWith('http') 
      ? pdfPath 
      : `${baseUrl}${pdfPath.startsWith('/') ? '' : '/'}${pdfPath}`;
  }

  if (loading) {
    return (
      <section className="px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </section>
    );
  }

  const imageSrc = book?.imageSrc 
    ? (book.imageSrc.startsWith('http') ? book.imageSrc : `${baseUrl}${book.imageSrc}`)
    : getRandomPlaceholder(book?._id || book?.id);

  const title = book?.title;
  const author = book?.author?.primary || book?.author;
  const category = book?.category?.name || book?.category;
  const description = book?.description?.full || book?.description?.short || book?.description;
  const rating = book?.rating?.average || book?.rating;
  const country = book?.publishingInfo?.country || book?.country;
  const releasedYear = book?.publishingInfo?.year || book?.releasedYear;
  const publisher = book?.publishingInfo?.publisher;
  const isbn = book?.metadata?.isbn;
  const pageCount = book?.physicalInfo?.pageCount;
  const language = book?.physicalInfo?.language;

  return (
    <section className="px-4 py-8">
      {showPDFViewer && (
        <PDFViewer 
          pdfUrl={getPdfUrl()} 
          title={title}
          onClose={() => setShowPDFViewer(false)}
        />
      )}
      <div className="max-w-6xl mx-auto">
        {book && <BreadCrumb book={book} category={category} />}
        {book ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <div className="relative">
                  <img 
                    className="w-full h-[400px] object-cover rounded-lg"
                    src={imageSrc}
                    alt={title || 'Book cover'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getRandomPlaceholder(book?._id || book?.id);
                    }}
                  />
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        onClick={() => navigate(`/books/edit/${bookId}`)}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                        title="Edit Book"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleDeleteBook}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                        title="Delete Book"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                {rating && (
                  <div className="mt-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-yellow-600">
                      {typeof rating === 'number' ? rating.toFixed(1) : rating} ⭐
                    </span>
                  </div>
                )}
                <div className="mt-6">
                  <button
                    onClick={handleReadBook}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>Read Book</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <p className="text-lg text-gray-600">
                    <span className="font-semibold">by</span> {author}
                  </p>
                  {category && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {category}
                    </span>
                  )}
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {country && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Country</h3>
                      <p className="text-lg">{country}</p>
                    </div>
                  )}
                  {releasedYear && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Released Year</h3>
                      <p className="text-lg">{releasedYear}</p>
                    </div>
                  )}
                  {publisher && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Publisher</h3>
                      <p className="text-lg">{publisher}</p>
                    </div>
                  )}
                  {pageCount && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Page Count</h3>
                      <p className="text-lg">{pageCount}</p>
                    </div>
                  )}
                  {language && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Language</h3>
                      <p className="text-lg">{language}</p>
                    </div>
                  )}
                  {isbn && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">ISBN</h3>
                      <p className="text-lg">{isbn}</p>
                    </div>
                  )}
                </div>
                {description && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-800">Book Not Available</h1>
            <p className="mt-4 text-gray-600">We couldn't find the book you're looking for.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default BookDetails;