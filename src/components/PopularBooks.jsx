import BookCard from "./BookCard";
import { useSelector } from "react-redux";

function PopularBooks() {
  const books = useSelector((state) => state.bookSlice.books);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-dark-900 mb-8">Popular Books</h2>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
        {books.length ? (
          books?.map((book) => {
            if (book?.rating >= 4.6) {
              return <BookCard key={book?._id} book={book} />;
            }
            return null;
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="animate-pulse text-xl text-gray-600">Loading...</div>
          </div>
        )}
      </section>
    </section>
  );
}

export default PopularBooks;
