import { deleteProduct, getProduct, updateProduct } from "@/controllers/productController";
import { dbConnect } from "@/lib/db";

export default async function handler(req, res) {
    await dbConnect();

    const { id } = req.query;

    if (!id || typeof id !== "string" || id === "undefined") {
        return res.status(400).json({ error: "Invalid or missing product ID" });
    }
    if (req.method === "GET") {
        return getProduct(req, res, id);
    } else if (req.method === "DELETE") {
        return deleteProduct(req, res, id);
    } else if (req.method === "PUT") {
        return updateProduct(req, res, id);
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
