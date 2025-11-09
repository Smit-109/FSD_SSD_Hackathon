import express from "express";
import { 
    addPopularBook, 
    getAllPopularBooks, 
    getPopularBookById, 
    updatePopularBook, 
    removePopularBook,
    removeBookFromPopular,
    reorderPopularBooks,
    checkIsPopular,
    togglePopularBook
} from "../controllers/popularBooks.controllers.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";

const popularBooksRouter = express.Router();

popularBooksRouter.get("/all", getAllPopularBooks);
popularBooksRouter.post("/reorder", protect, adminOnly, reorderPopularBooks);
popularBooksRouter.get("/check/:bookId", checkIsPopular);
popularBooksRouter.post("/toggle/:bookId", protect, adminOnly, togglePopularBook);
popularBooksRouter.get("/:id", getPopularBookById);

popularBooksRouter.post("/add", protect, adminOnly, addPopularBook);
popularBooksRouter.put("/:id", protect, adminOnly, updatePopularBook);
popularBooksRouter.delete("/:id", protect, adminOnly, removePopularBook);
popularBooksRouter.delete("/book/:bookId", protect, adminOnly, removeBookFromPopular);

export default popularBooksRouter;
