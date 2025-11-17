import { createProduct, getAllProducts, searchProducts } from "@/controllers/productController";
import { dbConnect } from "@/lib/db";

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === "GET") {
        const { query } = req.query;

        if (query) {
            return searchProducts(req, res);
        } else {
            return getAllProducts(req, res);
        }
    } else if (req.method === "POST") {
        return createProduct(req, res);
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
