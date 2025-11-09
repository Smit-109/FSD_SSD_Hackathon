import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateBooks } from "../utils/store/slices/bookSlice";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

function EditBookForm({ book: initialBook, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    releasedYear: "",
    rating: "",
    country: "",
    publisher: "",
    isbn: "",
    pageCount: "",
    language: "English",
    bookCover: null,
    pdf: null,
    currentPdf: "" // Add this field to track current PDF
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookLoading, setBookLoading] = useState(true);
  const [currentCoverImage, setCurrentCoverImage] = useState(null);
  const coverImageInput = useRef();
  const navigate = useNavigate();
  const { bookId } = useParams(); // Get bookId from URL parameters
  const dispatch = useDispatch();

  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${baseUrl}/api/v1/categories/all`);
        const categoriesRes = await res.json();
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    async function fetchBookDetails() {
      try {
        setBookLoading(true);
        const res = await fetch(`${baseUrl}/api/v1/books/book/${bookId}`);
        const bookRes = await res.json();
        
        if (bookRes.success) {
          const book = bookRes.data;
          setFormData({
            title: book.title || "",
            author: book.author?.primary || book.author || "",
            description: book.description?.full || book.description?.short || book.description || "",
            category: book.category?.name || book.category || "",
            releasedYear: book.publishingInfo?.year || book.releasedYear || "",
            rating: book.rating?.average || book.rating || "",
            country: book.publishingInfo?.country || book.country || "",
            publisher: book.publishingInfo?.publisher || "",
            isbn: book.metadata?.isbn || "",
            pageCount: book.physicalInfo?.pageCount || "",
            language: book.physicalInfo?.language || "English",
            bookCover: null,
            pdf: null,
            currentPdf: book.files?.pdfPath || book.files?.pdfSrc || book.files?.pdf || ""
          });
          
          // Set current cover image for display
          if (book.files?.coverImage) {
            setCurrentCoverImage(book.files.coverImage.startsWith('http') 
              ? book.files.coverImage 
              : `${baseUrl}${book.files.coverImage}`);
          }
        }
      } catch (error) {
        toast.error("Error loading book details");
        console.error("Error fetching book:", error);
      } finally {
        setBookLoading(false);
      }
    }

    fetchCategories();
    fetchBookDetails();
  }, [bookId]);

  function handleDataChange(e) {
    const { name, value, files, type } = e.target;

    setFormData((prevState) => {
      // Handle different input types appropriately
      let newValue = value;
      
      if (files) {
        newValue = files[0];
      } else if (type === 'number') {
        // Handle numeric inputs
        newValue = value === '' ? '' : Number(value);
      } else if (type === 'select-one') {
        // Handle select inputs
        newValue = value || '';
      } else {
        // Handle text inputs - ensure string type
        newValue = value != null ? String(value) : '';
      }
      
      return {
        ...prevState,
        [name]: newValue,
      };
    });
  }

  function handleUpdateBook(e) {
    e.preventDefault();

    const error = validateData(formData);
    if (error) return;

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      // Skip null/undefined values
      if (value == null) return;
      
      // Handle different field types
      if (key === "category") {
        // Handle category - normalize to lowercase if it's a string
        data.append(key, typeof value === 'string' ? value.trim().toLowerCase() : '');
      }
      else if (key === "bookCover" || key === "pdf") {
        // Handle file fields - only append if file is selected
        if (value instanceof File) {
          data.append(key, value);
        }
      }
      // Handle all other text fields - append even if empty string (for optional fields)
      else if (key !== "bookCover" && key !== "pdf" && value !== null && value !== undefined) {
        data.append(key, String(value));
      }
    });

    updateBook(data);
  }

  async function updateBook(data) {
    try {
      setLoading(true);

      // Log form data for debugging
      console.log('Updating book with ID:', bookId);
      console.log('Form data entries:');
      for (const [key, value] of data.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      const res = await fetch(`${baseUrl}/api/v1/books/update/${bookId}`, {
        method: "PUT",
        body: data,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        credentials: 'include'
      });

      // Check if response is ok before parsing JSON
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const response = await res.json();

      if (!response.success) {
        throw new Error(response.message || 'Failed to update book');
      }

      if (!response.data) {
        throw new Error('Update successful but no data returned');
      }

      toast.success("Book updated successfully!");
      
      // Update the Redux store - fetch all books to ensure consistency
      try {
        const booksRes = await fetch(`${baseUrl}/api/v1/books/all`);
        const booksData = await booksRes.json();
        if (booksData.success) {
          dispatch(updateBooks(booksData.data));
        }
      } catch (err) {
        console.error("Failed to refresh books list:", err);
      }
      
      // Get the updated book details to ensure we have the correct category
      try {
        const bookRes = await fetch(`${baseUrl}/api/v1/books/book/${bookId}`);
        const bookData = await bookRes.json();
      
        if (bookData.success && bookData.data) {
          const categoryName = bookData.data.category || bookData.data.genre || 'all';
          const bookIdToUse = bookData.data._id || bookId;
        
          // Redirect to book details page
          setTimeout(() => {
            navigate(`/books/${categoryName}/${bookIdToUse}`);
          }, 1000);
        } else {
          // Fallback navigation
          navigate('/books/all');
        }
      } catch (err) {
        console.error("Failed to fetch updated book:", err);
        // Fallback navigation
        navigate('/books/all');
      }

    } catch (error) {
      console.error("Update book error:", error);
      toast.error(error.message || "Failed to update book. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteBook() {
    if (!window.confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${baseUrl}/api/v1/books/delete/${bookId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const response = await res.json();

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete book');
      }

      toast.success("Book deleted successfully!");
      
      // Redirect to books page after a short delay
      setTimeout(() => {
        navigate('/books/all');
      }, 2000);

    } catch (error) {
      toast.error(error.message || "Failed to delete book. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function validateData(formData) {
    // Required fields validation
    const requiredFields = {
      title: "Title",
      author: "Author",
      description: "Description",
      category: "Category",
      releasedYear: "Released Year",
      rating: "Rating",
      country: "Country"
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      const value = formData[field];
      
      // Skip validation for non-required numeric fields if they're empty
      if ((field === 'rating' || field === 'releasedYear') && value === '') {
        continue;
      }
      
      // Basic existence check
      if (value == null) {
        toast.error(`${label} is required!`);
        return true;
      }

      // Type-specific validation
      switch (typeof value) {
        case 'string':
          if (value.trim() === '') {
            toast.error(`${label} is required!`);
            return true;
          }
          break;
        case 'number':
          if (isNaN(value)) {
            toast.error(`${label} must be a valid number!`);
            return true;
          }
          break;
        case 'object':
          // Handle File objects or other complex types
          if (!(value instanceof File) && Object.keys(value).length === 0) {
            toast.error(`${label} is required!`);
            return true;
          }
          break;
      }
    }

    // Additional category validation
    const category = formData.category;
    if (!category || 
        (typeof category === 'string' && category.trim() === '') ||
        (typeof category === 'object' && !category.id)) {
      toast.error("Please select a valid category!");
      return true;
    }

    // Book cover validation (only if a new file is selected)
    if (formData.bookCover) {
      if (!formData.bookCover.type.startsWith("image")) {
        toast.error("Book Cover must be an image file!");
        return true;
      }

      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedImageTypes.includes(formData.bookCover.type)) {
        toast.error("Book Cover must be JPG, PNG or WebP!");
        return true;
      }

      if (formData.bookCover.size > 5 * 1024 * 1024) {
        toast.error("Book Cover must be less than 5MB!");
        return true;
      }
    }

    // PDF validation (only if a new file is selected)
    if (formData.pdf) {
      if (formData.pdf.type !== 'application/pdf') {
        toast.error("Book file must be a PDF!");
        return true;
      }

      if (formData.pdf.size > 50 * 1024 * 1024) {
        toast.error("PDF file must be less than 50MB!");
        return true;
      }
    }

    // Rating validation
    const rating = parseFloat(formData.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      toast.error("Rating must be between 0 and 5!");
      return true;
    }

    // Year validation
    const year = parseInt(formData.releasedYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1800 || year > currentYear) {
      toast.error(`Year must be between 1800 and ${currentYear}!`);
      return true;
    }

    // Page count validation
    if (formData.pageCount && (isNaN(parseInt(formData.pageCount)) || parseInt(formData.pageCount) < 1)) {
      toast.error("Page count must be a positive number!");
      return true;
    }

    return false;
  }


  if (bookLoading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-dark-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-dark-900">Edit Book</h1>
          <button
            onClick={handleDeleteBook}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Delete Book
          </button>
        </div>

        <div className="card p-6">
          <form onSubmit={handleUpdateBook} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={(e) => handleDataChange(e)}
                  type="text"
                  className="input-field"
                  placeholder="Enter book title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                <input
                  value={formData.author}
                  name="author"
                  onChange={(e) => handleDataChange(e)}
                  type="text"
                  className="input-field"
                  placeholder="Enter author name"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => handleDataChange(e)}
                  className="input-field"
                  rows="4"
                  placeholder="Enter book description"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  className="input-field"
                  onChange={(e) => handleDataChange(e)}
                >
                  <option value="">Select Category</option>
                  {categories && categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Released Year</label>
                <input
                  name="releasedYear"
                  value={formData.releasedYear}
                  onChange={(e) => handleDataChange(e)}
                  type="number"
                  className="input-field"
                  placeholder="Enter release year"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
                <input
                  name="rating"
                  value={formData.rating}
                  onChange={(e) => handleDataChange(e)}
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  className="input-field"
                  placeholder="Enter rating"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin Country</label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={(e) => handleDataChange(e)}
                  type="text"
                  className="input-field"
                  placeholder="Enter country"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                <input
                  name="publisher"
                  value={formData.publisher}
                  onChange={(e) => handleDataChange(e)}
                  type="text"
                  className="input-field"
                  placeholder="Enter publisher"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                <input
                  name="isbn"
                  value={formData.isbn}
                  onChange={(e) => handleDataChange(e)}
                  type="text"
                  className="input-field"
                  placeholder="Enter ISBN"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Count</label>
                <input
                  name="pageCount"
                  value={formData.pageCount}
                  onChange={(e) => handleDataChange(e)}
                  type="number"
                  className="input-field"
                  placeholder="Enter page count"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <input
                  name="language"
                  value={formData.language}
                  onChange={(e) => handleDataChange(e)}
                  type="text"
                  className="input-field"
                  placeholder="Enter language"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book Cover Image (Optional)</label>
                <input
                  ref={coverImageInput}
                  name="bookCover"
                  onChange={(e) => handleDataChange(e)}
                  type="file"
                  accept="image/*"
                  className="input-field"
                />
                {currentCoverImage && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Current cover image:</p>
                    <img 
                      src={currentCoverImage} 
                      alt="Current cover" 
                      className="w-24 h-32 object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">Leave blank to keep current image</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book PDF (Optional)</label>
                <input
                  name="pdf"
                  onChange={(e) => handleDataChange(e)}
                  type="file"
                  accept=".pdf"
                  className="input-field"
                />
                {formData.currentPdf && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Current PDF file:</p>
                    <a 
                      href={formData.currentPdf.startsWith('http') ? formData.currentPdf : `${baseUrl}${formData.currentPdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      View Current PDF
                    </a>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">Leave blank to keep current PDF</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={loading}
              >
                Update Book
                {loading && (
                  <span className="ml-2 inline-block w-4 h-4 border-t-white border-t-2 border-e-2 animate-spin rounded-full"></span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
    </section>
  );
}

export default EditBookForm;