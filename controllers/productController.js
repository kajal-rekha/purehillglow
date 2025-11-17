import Category from "@/models/Category";
import Product from "@/models/Product";
import SubCategory from "@/models/SubCategory";

//==================== Create Product ======================//
export const createProduct = async (req, res) => {
    try {
        const {
            name,
            images,
            description,
            benefits,
            ingredients,
            usage,
            price,
            origin,
            unit,
            stock,
            discount,
            featured,
            category,
            subCategory,
            tags,
        } = req.body;

        // ======== Validate category ======== //
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({ error: "Category not found" });
        }

        //====== Validate subcategory =======//
        if (subCategory) {
            const subExists = await SubCategory.findById(subCategory);
            if (!subExists) {
                return res.status(400).json({ error: "Subcategory not found" });
            }
        }

        const product = new Product({
            name,
            images,
            description,
            benefits,
            ingredients,
            usage,
            price,
            origin,
            unit,
            stock,
            discount,
            featured,
            category_id: category,
            subcategory_id: subCategory,
            tags,
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//==================== Get All Products ===================//
export const getAllProducts = async (req, res) => {
    try {
        const { subCategory } = req.query;

        const query = {};

        if (subCategory) {
            query.subcategory_id = subCategory;
        }

        const products = await Product.find(query)
            .populate("category_id", "name")
            .populate("subcategory_id", "name");

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//==================== Get Single Product =================//
export const getProduct = async (req, res, id) => {
    try {
        const product = await Product.findById(id)
            .populate("category_id", "name")
            .populate("subcategory_id", "name");
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product:", error.message);
        res.status(500).json({ error: error.message });
    }
};

//==================== Search Products ===================//
export const searchProducts = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Search query is required" });
        }

        const products = await Product.find({
            "name.en": { $regex: query, $options: "i" },
        })
            .populate("category", "name")
            .populate("subCategory", "name");

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found!" });
        }

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//==================== Update Product ===================//
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.query;
        const updates = req.body;

        if (updates.category) {
            const categoryExists = await Category.findById(updates.category);
            if (!categoryExists) {
                return res.status(400).json({ error: "Category not found" });
            }
        }

        if (updates.subCategory) {
            const subExists = await SubCategory.findById(updates.subCategory);
            if (!subExists) {
                return res.status(400).json({ error: "Subcategory not found" });
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!updatedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: error.message });
    }
};

//==================== Delete Product =====================//
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.query;

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
