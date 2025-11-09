import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Categories() {
  const [categories, setCategories] = useState([]);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch(`${baseUrl}/api/v1/categories/all`);
      const categories = await res.json();

      setCategories(categories.data);
    }

    fetchCategories();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-dark-900 mb-6">Search by Categories</h2>
      <section
        id="scrollbar-hide"
        className="flex gap-x-4 pb-4 overflow-x-auto">
        {categories?.map((category) => {
          return (
            <Link to={"/books/" + category?.name} key={category?._id}>
              <article className="bg-blue-900 text-white px-6 py-3 rounded-lg whitespace-nowrap hover:bg-blue-800 transition-colors">
                <p className="text-base font-medium">
                  {category?.name.slice(0, 1).toUpperCase() +
                    category?.name.slice(1)}
                </p>
              </article>
            </Link>
          );
        })}
      </section>
    </section>
  );
}

export default Categories;
