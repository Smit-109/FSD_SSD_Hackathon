import Hero from "../components/Hero";
import Categories from "../components/Categories";
import PopularBooks from "../components/PopularBooks";
import { useEffect } from "react";

function HomePage() {
  useEffect(() => {
    // To Scroll the page to top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col gap-16">
      <Hero />
      <Categories />
      <PopularBooks />
    </div>
  );
}

export default HomePage;
