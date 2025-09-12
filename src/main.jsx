import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter } from "react-router-dom";
import HomePage from './pages/HomePage.jsx';
import BrowseBooks from "./components/BrowseBooks.jsx";
import BookDetails from "./components/BookDetails.jsx";
import AddBookForm from './components/AddBookForm.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import { RouterProvider } from 'react-router-dom';
import Error from './components/Error.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HomePage />
      },
      {
        path: "/books/:category",
        element: <BrowseBooks />
      },
      {
        path: "/books/:category/:bookId",
        element: <BookDetails />
      },
      {
        path: "/login",
        element: <LoginPage />
      },
      {
        path: "/register",
        element: <RegisterPage />
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )
      },
      {
        path: "/favorites",
        element: (
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        )
      },
      {
        path: "/add-book",
        element: (
          <ProtectedRoute requireVerification={true}>
            <AddBookForm />
          </ProtectedRoute>
        )
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        )
      }
    ],
    errorElement: <Error />
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={appRouter} />
  </StrictMode>,
)
