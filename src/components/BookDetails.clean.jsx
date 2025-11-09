import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BreadCrumb from './BreadCrumb';
import { useAuth } from '../contexts/AuthContext';
import { Edit, Trash2 } from 'lucide-react';
import EditBookForm from './EditBookForm';
import toast from 'react-hot-toast';

export default function BookDetails() {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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

  const fetchBookById = async (url) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      const resJson = await res.json();
      
      if (!res.ok) {
        throw new Error(resJson.message || 'Failed to fetch book details');
      }
      
      setBook(resJson.book);
    } catch (err) {
      console.error('Error fetching book:', err);
      setError(err.message || 'Error loading book details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const response = await fetch(`${baseUrl}/api/v1/books/delete/${bookId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete book');
        }
        
        toast.success('Book deleted successfully');
        navigate('/');
      } catch (error) {
        console.error('Error deleting book:', error);
        toast.error('Failed to delete book');
      }
    }
  };

  if (loading) {
    return (
      <section className="px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
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

  // Book data
  const imageSrc = book?.imageSrc 
    ? (book.imageSrc.startsWith('http') ? book.imageSrc : `${baseUrl}${book.imageSrc}`)
    : null;
  const title = book?.title || '';
  const author = book?.author?.primary || book?.author || '';
  const category = book?.category?.name || book?.category || '';
  const description = book?.description?.full || book?.description?.short || book?.description || '';
  const rating = book?.rating?.average || book?.rating || 0;
  const country = book?.publishingInfo?.country || book?.country || '';
  const releasedYear = book?.publishingInfo?.year || book?.releasedYear || '';
  const publisher = book?.publishingInfo?.publisher || book?.publisher || '';
  const isbn = book?.metadata?.isbn || book?.isbn || '';
  const pageCount = book?.physicalInfo?.pageCount || book?.pageCount || '';
  const language = book?.physicalInfo?.language || book?.language || '';

  return (
    <section className="px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {book && <BreadCrumb book={book} category={category} />}
        
        {isEditing ? (
          <EditBookForm 
            book={book} 
            onCancel={() => setIsEditing(false)} 
          />
        ) : book ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            {/* Book Cover */}
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg">
              {imageSrc && (
                <img 
                  src={imageSrc} 
                  alt={`Cover of ${title}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Book Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
                  
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit book"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="p-2 text-red-600 hover:text-red-800 transition-colors"
                        title="Delete book"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                
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
                  
                  {rating > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500">Rating</h3>
                      <p className="text-lg">⭐ {rating}/5</p>
                    </div>
                  )}
                </div>
                
                {description && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{description}</p>
                  </div>
                )}
                
                <div className="mt-8 flex flex-wrap gap-4">
                  <button className="btn-primary">
                    Read Book
                  </button>
                  <button className="btn-secondary">
                    Add to Favorites
                  </button>
                </div>
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