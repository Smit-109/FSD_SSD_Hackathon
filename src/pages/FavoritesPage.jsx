import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Heart, BookOpen, Star, Calendar } from 'lucide-react';
import BookCard from '../components/BookCard';

const FavoritesPage = () => {
  const { user } = useAuth();
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch the full book details for favorite book IDs
    // For now, we'll simulate this
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-dark-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-dark-900 mb-2">My Favorite Books</h1>
          <p className="text-dark-600">Your curated collection of beloved reads</p>
        </div>

        {favoriteBooks.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-dark-900 mb-2">No favorites yet</h3>
            <p className="text-dark-600 mb-8 max-w-md mx-auto">
              Start building your personal library by adding books to your favorites. 
              Look for the heart icon on any book you love!
            </p>
            <a 
              href="/books/all" 
              className="btn-primary inline-flex items-center space-x-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>Browse Books</span>
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteBooks.map((book) => (
                <BookCard key={book._id} book={book} showFavoriteButton={false} />
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <div className="card p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-dark-900 mb-2">
                  Reading Stats
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="h-5 w-5 text-red-500 mr-1" />
                      <span className="text-2xl font-bold text-dark-900">
                        {favoriteBooks.length}
                      </span>
                    </div>
                    <p className="text-sm text-dark-600">Favorites</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <BookOpen className="h-5 w-5 text-blue-500 mr-1" />
                      <span className="text-2xl font-bold text-dark-900">
                        {user?.readBooks?.length || 0}
                      </span>
                    </div>
                    <p className="text-sm text-dark-600">Books Read</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
