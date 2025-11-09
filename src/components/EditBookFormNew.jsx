import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "../contexts/AuthContext";
import { updateBooks } from "../utils/store/slices/bookSlice";
import toast from "react-hot-toast";
import { Loader2, AlertCircle } from "lucide-react";
import axios from 'axios';

function EditBookFormNew() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAdmin, user } = useAuth();
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

  // Helper function to construct proper URLs
  const getFullUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Remove any duplicate slashes and ensure proper path structure
    const cleanPath = path.replace(/^\/+/, '').replace(/\/+/g, '/');
    return `${baseUrl}/${cleanPath}`;
  };

  // Check for admin access immediately
  useEffect(() => {
    if (!user || !isAdmin) {
      toast.error("You don't have permission to edit books");
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    releasedYear: "",
    rating: "",
    country: "",
    bookCover: null,
    pdf: null,
    publisher: "",
    isbn: "",
    pageCount: "",
    language: "English"
  });

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
    const [currentFiles, setCurrentFiles] = useState({
    coverImage: null,
    pdf: null
  });  useEffect(() => {
    const fetchData = async () => {
      if (!bookId || !isAdmin) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch book details and categories in parallel
        console.log('Fetching book with ID:', bookId);
        // Using fetch instead of axios for better error handling
        const [bookResult, categoriesResult] = await Promise.all([
          fetch(`${baseUrl}/api/v1/books/${bookId}`, {
            credentials: 'include',
            headers: {
              'Accept': 'application/json'
            }
          }),
          fetch(`${baseUrl}/api/v1/categories/all`, {
            credentials: 'include'
          })
        ]);

        if (!bookResult.ok) {
          throw new Error(`Failed to fetch book details. Status: ${bookResult.status}`);
        }
        if (!categoriesResult.ok) {
          throw new Error(`Failed to fetch categories. Status: ${categoriesResult.status}`);
        }

        const bookData = await bookResult.json();
        const categoriesData = await categoriesResult.json();

        console.log('Book API Response:', bookData);
        console.log('Categories API Response:', categoriesData);

        if (!bookData.success || !bookData.data) {
          throw new Error('Book data not found');
        }

        const book = bookData.data;
        
        // Handle cover image and PDF files
        let coverImageUrl = '';
        let pdfUrl = '';

        if (book.files) {
          coverImageUrl = getFullUrl(book.files.coverImage);
          pdfUrl = getFullUrl(book.files.pdf);
        } else if (book.imageSrc) {
          // Fallback for different data structure
          coverImageUrl = getFullUrl(book.imageSrc);
        }

        console.log('Cover Image URL:', coverImageUrl);
        console.log('PDF URL:', pdfUrl);

        // Check responses
        if (!bookData.success || !categoriesData.success) {
          throw new Error(bookData.message || categoriesData.message || 'Failed to load data');
        }

        // Set book data
        const book = bookData.data;
        if (!book) {
          throw new Error('Book data is empty');
        }

        console.log('Processing book data:', book);

        // Set form data with careful handling of nested objects
        setFormData({
          title: book.title || "",
          author: typeof book.author === 'object' ? book.author.primary : book.author || "",
          description: typeof book.description === 'object' ? 
            book.description.full || book.description.short : 
            book.description || "",
          category: typeof book.category === 'object' ? book.category.name : book.category || "",
          releasedYear: String(
            typeof book.publishingInfo === 'object' ? 
              book.publishingInfo.year : 
              book.releasedYear || ""
          ),
          rating: String(
            typeof book.rating === 'object' ? 
              book.rating.average : 
              book.rating || ""
          ),
          country: typeof book.publishingInfo === 'object' ? 
            book.publishingInfo.country : 
            book.country || "",
          publisher: typeof book.publishingInfo === 'object' ? 
            book.publishingInfo.publisher : 
            book.publisher || "",
          isbn: typeof book.metadata === 'object' ? 
            book.metadata.isbn : 
            book.isbn || "",
          pageCount: String(
            typeof book.physicalInfo === 'object' ? 
              book.physicalInfo.pageCount : 
              book.pageCount || ""
          ),
          language: typeof book.physicalInfo === 'object' ? 
            book.physicalInfo.language : 
            book.language || "English",
          bookCover: null,
          pdf: null
        });

        // Set current files with proper URLs
        setCurrentFiles({
          coverImage: coverImageUrl,
          pdf: pdfUrl
        });

        // Set current files
        if (book.files) {
          const coverImageUrl = book.files.coverImage || "";
          const pdfUrl = book.files.pdf || "";
          
          // Ensure URLs are absolute
          setCurrentFiles({
            coverImage: coverImageUrl.startsWith('http') ? 
              coverImageUrl : 
              `${baseUrl}${coverImageUrl.startsWith('/') ? '' : '/'}${coverImageUrl}`,
            pdf: pdfUrl.startsWith('http') ? 
              pdfUrl : 
              `${baseUrl}${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`
          });
          
          console.log('Set current files:', {
            coverImage: coverImageUrl,
            pdf: pdfUrl
          });
        }

        // Set categories
        setCategories(categoriesData.data || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load book data';
        setError(errorMessage);
        toast.error(errorMessage);
        
        // Log detailed error information
        console.log('Error details:', {
          error,
          response: error.response,
          status: error.response?.status,
          data: error.response?.data
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [bookId, baseUrl, isAdmin, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookId) return;

    setIsLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      // Validate required fields first
      const requiredFields = ['title', 'author', 'description', 'category', 'releasedYear'];
      const missingFields = requiredFields.filter(field => {
        const value = formData[field];
        return !value || (typeof value === 'string' && value.trim() === '');
      });
      
      if (missingFields.length > 0) {
        throw new Error(`Required fields missing: ${missingFields.join(', ')}`);
      }

      // Validate numeric fields
      const year = parseInt(formData.releasedYear);
      if (isNaN(year) || year < 1800 || year > new Date().getFullYear()) {
        throw new Error('Invalid release year');
      }

      if (formData.pageCount && formData.pageCount !== '') {
        const pages = parseInt(formData.pageCount);
        if (isNaN(pages) || pages < 1) {
          throw new Error('Invalid page count');
        }
      }

      if (formData.rating && formData.rating !== '') {
        const rating = parseFloat(formData.rating);
        if (isNaN(rating) || rating < 0 || rating > 5) {
          throw new Error('Invalid rating');
        }
      }

      // Append text fields with explicit type conversion
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'bookCover' && key !== 'pdf' && value != null) {
          // Convert numbers to strings
          if (key === 'releasedYear' || key === 'pageCount') {
            const numValue = parseInt(value);
            formDataToSend.append(key, !isNaN(numValue) ? String(numValue) : '');
          }
          // Convert rating to float
          else if (key === 'rating') {
            const numValue = parseFloat(value);
            formDataToSend.append(key, !isNaN(numValue) ? String(numValue) : '');
          }
          // Handle other fields
          else {
            formDataToSend.append(key, typeof value === 'string' ? value.trim() : String(value));
          }
        }
      });

      // Validate and append files
      if (formData.bookCover instanceof File) {
        if (!formData.bookCover.type.startsWith('image/')) {
          throw new Error('Invalid book cover file type. Please select an image file.');
        }
        formDataToSend.append('bookCover', formData.bookCover);
      }

      if (formData.pdf instanceof File) {
        if (formData.pdf.type !== 'application/pdf') {
          throw new Error('Invalid file type. Please select a PDF file.');
        }
        formDataToSend.append('pdf', formData.pdf);
      }

      const response = await fetch(`${baseUrl}/api/v1/books/update/${bookId}`, {
        method: 'PUT',
        body: formDataToSend,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        // Ensure the response data has the expected structure
        if (!data.data || typeof data.data !== 'object') {
          throw new Error('Invalid response data structure');
        }

        // Update the store with the new book data
        dispatch(updateBooks(prevBooks => 
          prevBooks.map(book => 
            book._id === data.data._id ? {
              ...book,
              ...data.data,
              // Ensure nested objects are preserved
              author: typeof data.data.author === 'object' ? data.data.author : { primary: data.data.author },
              description: typeof data.data.description === 'object' ? data.data.description : { 
                short: data.data.description,
                full: data.data.description
              },
              publishingInfo: typeof data.data.publishingInfo === 'object' ? data.data.publishingInfo : {
                year: data.data.releasedYear,
                country: data.data.country,
                publisher: data.data.publisher
              }
            } : book
          )
        ));

        toast.success("Book updated successfully");
        navigate(`/books/all`);
      } else {
        throw new Error(data.message || "Failed to update book");
      }
    } catch (error) {
      console.error('Error updating book:', error);
      
      // Format error message for display
      let errorMessage = error.message;
      if (error.message.includes('413')) {
        errorMessage = 'File size too large. Please choose smaller files.';
      } else if (error.message.includes('415')) {
        errorMessage = 'Invalid file type. Please check your uploads.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Invalid data. Please check all fields.';
      }

      setError(errorMessage);
      toast.error(errorMessage);
      
      // Show specific field errors
      if (error.message.includes('Required fields')) {
        const fields = error.message.split(':')[1]?.trim().split(',') || [];
        fields.forEach(field => {
          const element = document.getElementById(field.trim());
          if (element) {
            element.classList.add('border-red-500');
            element.focus();
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Book</h1>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Author & Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Author *
            </label>
            <input
              type="text"
              id="author"
              name="author"
              required
              value={formData.author}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Publishing Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-1">
              Publisher
            </label>
            <input
              type="text"
              id="publisher"
              name="publisher"
              value={formData.publisher}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="releasedYear" className="block text-sm font-medium text-gray-700 mb-1">
              Released Year *
            </label>
            <input
              type="number"
              id="releasedYear"
              name="releasedYear"
              required
              min="1800"
              max={new Date().getFullYear()}
              value={formData.releasedYear}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Book Details Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
              ISBN
            </label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              value={formData.isbn}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="pageCount" className="block text-sm font-medium text-gray-700 mb-1">
              Page Count
            </label>
            <input
              type="number"
              id="pageCount"
              name="pageCount"
              min="1"
              value={formData.pageCount}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <input
              type="text"
              id="language"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* File Upload Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bookCover" className="block text-sm font-medium text-gray-700 mb-1">
              Book Cover
            </label>
            <input
              type="file"
              id="bookCover"
              name="bookCover"
              accept="image/*"
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {currentFiles.coverImage && !formData.bookCover && (
              <p className="text-sm text-gray-500 mt-1">
                Current cover image will be kept if no new image is selected
              </p>
            )}
            {currentFiles.coverImage && (
              <div className="mt-2">
                <img 
                  src={currentFiles.coverImage}
                  alt="Current cover" 
                  className="w-32 h-40 object-cover rounded-lg"
                  onError={(e) => {
                    console.error('Image failed to load:', e.target.src);
                    e.target.src = 'https://via.placeholder.com/128x160?text=No+Image';
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="pdf" className="block text-sm font-medium text-gray-700 mb-1">
              PDF File
            </label>
            <input
              type="file"
              id="pdf"
              name="pdf"
              accept=".pdf"
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {currentFiles.pdf && !formData.pdf && (
              <p className="text-sm text-gray-500 mt-1">
                Current PDF will be kept if no new file is selected
              </p>
            )}
            {currentFiles.pdf && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Current PDF: {currentFiles.pdf.split('/').pop()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space

-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Update Book</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditBookFormNew;