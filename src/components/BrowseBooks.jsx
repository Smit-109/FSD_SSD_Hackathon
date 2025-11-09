/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import BookCard from "./BookCard";
import { updateBooks } from "../utils/store/slices/bookSlice";

function BrowseBooks() {
  const { category } = useParams();
  const allBooks = useSelector((state) => state.bookSlice.books);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [bookInput, setBookInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    // Scroll to top when category changes
    window.scrollTo(0, 0);
    
    // Reset states
    setFilteredBooks([]);
    setError(null);
    
    // Fetch books based on category
    if (category && category !== "all") {
      fetchBooksByCategory(category);
    } else if (category === "all") {
      fetchAllBooks();
    } else {
      // Default to all books
      fetchAllBooks();
    }
  }, [category]);

  async function fetchAllBooks() {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/v1/books/all`);
      const result = await response.json();
      
      if (result.success) {
        setBooks(result.data);
        setFilteredBooks(result.data);
        dispatch(updateBooks(result.data));
      } else {
        // Fallback to mock data if API fails
        import("../utils/mockdata").then(({ books }) => {
          setBooks(books);
          setFilteredBooks(books);
          dispatch(updateBooks(books));
        });
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      // Fallback to mock data if API fails
      import("../utils/mockdata").then(({ books }) => {
        setBooks(books);
        setFilteredBooks(books);
        dispatch(updateBooks(books));
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchBooksByCategory(categoryName) {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/v1/books/category/${categoryName}`);
      const result = await response.json();
      
      if (result.success) {
        setBooks(result.data);
        setFilteredBooks(result.data);
      } else if (result.status === "success") {
        setBooks(result.data);
        setFilteredBooks(result.data);
      } else {
        // Fallback to filtering mock data
        import("../utils/mockdata").then(({ books }) => {
          const filtered = books.filter(book => 
            book.category && book.category.toLowerCase() === categoryName.toLowerCase()
          );
          setBooks(filtered);
          setFilteredBooks(filtered);
        });
      }
    } catch (error) {
      console.error("Error fetching books by category:", error);
      // Fallback to filtering mock data
      import("../utils/mockdata").then(({ books }) => {
        const filtered = books.filter(book => 
          book.category && book.category.toLowerCase() === categoryName.toLowerCase()
        );
        setBooks(filtered);
        setFilteredBooks(filtered);
      });
    } finally {
      setLoading(false);
    }
  }

  async function searchBooks(query) {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/v1/books/search?q=${encodeURIComponent(query)}`);
      const result = await response.json();
      
      if (result.success) {
        setFilteredBooks(result.data);
      } else if (result.status === "success") {
        setFilteredBooks(result.data);
      } else {
        // Fallback to filtering mock data
        import("../utils/mockdata").then(({ books }) => {
          const filtered = books.filter(book => 
            (book.title && book.title.toLowerCase().includes(query.toLowerCase())) ||
            (book.author && book.author.toLowerCase().includes(query.toLowerCase()))
          );
          setFilteredBooks(filtered);
        });
      }
    } catch (error) {
      console.error("Error searching books:", error);
      // Fallback to filtering mock data
      import("../utils/mockdata").then(({ books }) => {
        const filtered = books.filter(book => 
          (book.title && book.title.toLowerCase().includes(query.toLowerCase())) ||
          (book.author && book.author.toLowerCase().includes(query.toLowerCase()))
        );
        setFilteredBooks(filtered);
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (bookInput.trim()) {
      searchBooks(bookInput);
    }
  };

  if (loading) {
    return (
      <section className="min-h-[488px] flex flex-col items-center mt-7">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-[488px] flex flex-col items-center mt-7">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[488px] flex flex-col items-center mt-7 px-4">
      <h1 className="text-3xl text-center font-semibold italic mb-7">
        Your Perfect Book is Just a Search Away!
      </h1>
      
      <form onSubmit={handleSearch} className="w-full max-w-2xl mb-10">
        <div className="flex items-center">
          <input
            value={bookInput}
            onChange={(e) => setBookInput(e.target.value)}
            type="text"
            className="flex-grow ps-4 pe-3 py-3 text-lg rounded-s-full outline-none border-2 border-blue-900"
            placeholder="Search by Book Name or Author Name"
          />
          <button 
            type="submit"
            className="bg-blue-900 text-white font-semibold text-lg px-6 py-3 rounded-e-full hover:bg-blue-800 transition-colors whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </form>
      
      <div className="w-full">
        <h2 className="text-2xl font-semibold mb-6 text-left">
          {category && category !== "all" ? `${category.charAt(0).toUpperCase() + category.slice(1)} Books` : "All Books"}
        </h2>
        
        {filteredBooks.length > 0 ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
            {filteredBooks.map((book) => (
              <BookCard key={book?._id || book?.id} book={book} />
            ))}
          </section>
        ) : (
          <div className="text-center py-12">
            <h1 className="text-black font-semibold text-3xl mb-4">
              No Books Found
            </h1>
            <p className="text-gray-600">
              Try adjusting your search or browse different categories
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default BrowseBooks;