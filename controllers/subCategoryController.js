import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";


//================ Create Subcategory ====================//
export const createSubcategory = async (req, res) => {
    try {
        const { category, name, image } = req.body;

        if (!category || !name || !image) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const existingCategory = await Category.findById(category);
        if (!existingCategory) {
            return res.status(404).json({ error: "Category not found." });
        }

        const subcategory = await SubCategory.create({
            category_id: category,
            name,
            image,
        });

        res.status(201).json(subcategory);
    } catch (error) {
        console.error("Error creating subcategory:", error);
        res.status(500).json({ error: error.message });
    }
};

//========== Get All Subcategories ==============//
export const getAllSubcategories = async (req, res) => {
    try {
        const { category } = req.query;

        const query = category ? { category_id: category } : {};

        const subcategories = await SubCategory.find(query);
        res.status(200).json(subcategories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//========== Get a Subcategory ==========//
export const getASubcategory = async (req, res, id) => {
    try {
        if (!id) {
            return res
                .status(400)
                .json({ error: "Subcategory ID is required." });
        }

        const subcategory = await SubCategory.findById(id);
        if (!subcategory) {
            return res.status(404).json({ error: "Subcategory not found." });
        }
        res.status(200).json(subcategory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//========== Update a Subcategory ==========//
export const updateSubcategory = async (req, res, id) => {
    try {
        const { name, image, category_id } = req.body;

        if (!id) {
            return res
                .status(400)
                .json({ error: "Subcategory ID is required." });
        }

        const updatedSubcategory = await SubCategory.findByIdAndUpdate(
            id,
            { name, image, category_id },
            { new: true }
        );

        if (!updatedSubcategory) {
            return res.status(404).json({ error: "Subcategory not found." });
        }

        res.status(200).json(updatedSubcategory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//========== Delete a Subcategory ==========//
export const deleteSubcategory = async (req, res, id) => {
    try {
        if (!id) {
            return res
                .status(400)
                .json({ error: "Subcategory ID is required." });
        }

        const deletedSubcategory = await SubCategory.findByIdAndDelete(id);
        if (!deletedSubcategory) {
            return res.status(404).json({ error: "Subcategory not found." });
        }

        res.status(200).json({ message: "Subcategory deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
