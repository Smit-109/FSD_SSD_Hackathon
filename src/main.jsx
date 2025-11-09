import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import bookStore from './utils/store/bookStore'
import App from './App.jsx'
import { createBrowserRouter } from "react-router-dom";
import HomePage from './pages/HomePage.jsx';
import BrowseBooks from "./components/BrowseBooks.jsx";
import BookDetails from "./components/BookDetails.jsx";
import AddBookForm from './components/AddBookForm.jsx';
import EditBookForm from './components/EditBookForm.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
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
        path: "/books/edit/:bookId",
        element: (
          <ProtectedRoute requireAdmin={true}>
            <EditBookForm />
          </ProtectedRoute>
        )
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
        path: "/add-book",
        element: (
          <ProtectedRoute requireAdmin={true}>
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
    <Provider store={bookStore}>
      <RouterProvider router={appRouter} />
    </Provider>
  </StrictMode>
)
