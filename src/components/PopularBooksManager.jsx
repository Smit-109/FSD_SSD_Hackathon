import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Search, Loader, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PopularBooksManager = () => {
  const [books, setBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [togglingBooks, setTogglingBooks] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksRes, popularRes] = await Promise.all([
        axios.get('/api/v1/books/all?limit=1000'),
        axios.get('/api/v1/popular-books/all?limit=1000&active=true')
      ]);

      if (booksRes.data.success) {
        setBooks(booksRes.data.data);
        
        const uniqueCategories = [...new Set(booksRes.data.data.map(b => b.category))];
        setCategories(uniqueCategories);
      }

      if (popularRes.data.success) {
        const popularBookIds = new Set(
          popularRes.data.data.map(pb => pb.book._id)
        );
        setPopularBooks(popularBookIds);
      }
    } catch (error) {
      toast.error('Failed to fetch books');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePopular = async (bookId) => {
    try {
      setTogglingBooks(new Set([...togglingBooks, bookId]));

      const response = await axios.post(
        `/api/v1/popular-books/toggle/${bookId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        const newPopularBooks = new Set(popularBooks);
        if (response.data.isPopular) {
          newPopularBooks.add(bookId);
          toast.success('Book added to popular');
        } else {
          newPopularBooks.delete(bookId);
          toast.success('Book removed from popular');
        }
        setPopularBooks(newPopularBooks);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle popular book');
      console.error('Error toggling popular book:', error);
    } finally {
      setTogglingBooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookId);
        return newSet;
      });
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || book.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-4 text-dark-600">Loading popular books manager...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-dark-900 mb-2">Manage Popular Books</h2>
        <p className="text-dark-500 text-sm">Select or deselect books to manage popular collection</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
        <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          Click on a book to toggle it as popular. Popular books will be displayed on the homepage.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => {
            const isPopular = popularBooks.has(book._id);
            const isToggling = togglingBooks.has(book._id);

            return (
              <button
                key={book._id}
                onClick={() => handleTogglePopular(book._id)}
                disabled={isToggling}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  isPopular
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-gray-200 bg-white hover:border-yellow-200'
                } ${isToggling ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-dark-900 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-dark-500 mt-1">{book.author}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {book.category}
                      </span>
                      {book.rating > 0 && (
                        <span className="text-xs flex items-center">
                          <span className="text-yellow-500 mr-1">⭐</span>
                          {book.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {isPopular && !isToggling && (
                    <Star className="h-6 w-6 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  )}

                  {isToggling && (
                    <Loader className="h-6 w-6 text-primary-600 animate-spin flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No books found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm || filterCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No books available'}
            </p>
          </div>
        )}
      </div>

      {filteredBooks.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-dark-600">
            <span className="font-semibold text-primary-600">{popularBooks.size}</span> book(s) marked as popular
          </p>
        </div>
      )}
    </div>
  );
};

export default PopularBooksManager;
