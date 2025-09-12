import express from "express";
import { addCategory, getAllCategory } from "../controllers/categories.controllers.js";

const categoriesRouter = new express.Router();

categoriesRouter.post("/add/:category", addCategory);
categoriesRouter.get("/all", getAllCategory);

export default categoriesRouter;