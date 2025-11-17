import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";

export default async function handler(req, res) {
    await dbConnect();

    const { id } = req.query;
    const { quantity } = req.body;

    if (!id || typeof id !== "string" || id === "undefined") {
        return res.status(400).json({ error: "Invalid or missing product ID" });
    }

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: "Invalid quantity" });
    }

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ error: "Insufficient stock" });
        }

        product.stock -= quantity;
        await product.save();

        return res.status(200).json({
            message: "Stock updated successfully",
            updatedStock: product.stock,
        });
    } catch (error) {
        console.error("Error updating stock:", error);
        return res.status(500).json({ error: "Something went wrong!" });
    }
}
