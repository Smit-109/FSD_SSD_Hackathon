import Header from "./components/Header";
import Footer from "./components/Footer";
import "./index.css";
import { Provider, useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { updateBooks } from "./utils/store/slices/bookSlice";
import bookStore from "./utils/store/bookStore";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";

function AppBody() {
  const dispatch = useDispatch();
  const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
  const { loading } = useAuth();

  useEffect(() => {
    async function fetchBooks() {
      try {
        const url = `${baseUrl}/api/v1/books/all`;
        console.log('Fetching books from:', url);
        
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const resJson = await res.json();
        console.log('API Response:', resJson);
        
        if (resJson.success) {
          dispatch(updateBooks(resJson.data));
        } else {
          throw new Error(resJson.message || 'Failed to fetch books');
        }
      } catch (error) {
        console.error("Failed to fetch books:", error);
        // Load mock data as fallback
        const { books } = await import("./utils/mockdata");
        console.log('Loading mock data:', books);
        dispatch(updateBooks(books));
      }
    }

    fetchBooks();
  }, [baseUrl, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-dark-600">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 25px -5px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Provider store={bookStore}>
        <AppBody />
      </Provider>
    </AuthProvider>
  );
}

export default App;