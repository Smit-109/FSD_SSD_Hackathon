import Category from "../models/categories.models.js";

export async function addCategory(req, res) {
    try {
        const { category } = req.params;

        if (category.trim() === "") {
            return res.status(400).json({
                errorCode: "CATEGORY_MISSING",
                message: "Category is missing in params !"
            });
        }

        const categoryDoc = await Category.create({
            name: category
        });

        if (!categoryDoc) {
            return res.status(400).json({
                errorCode: "ADD_CATEGORY_ERROR",
                message: "An error occured while adding new category !"
            });
        }

        res.status(201).send({ status: "success", data: category });
    } catch (error) {
        return res.status(500).json({
            error: error.message || error,
            errorCode: "ADD_CATEGORY_ERROR",
            message: "Internal Server Error"
        });
    }
}

export async function getAllCategory(req, res) {
    try {
        const categories = await Category.find();

        res.status(200).send({ status: "success", data: categories });
    } catch (error) {
        return res.status(500).json({
            error: error.message || error,
            errorCode: "GET_ALL_CATEGORY_ERROR",
            message: "Internal Server Error"
        });
    }
}