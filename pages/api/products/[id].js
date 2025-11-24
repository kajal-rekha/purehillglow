import {
    deleteProduct,
    getProduct,
    updateProduct,
} from "@/controllers/productController";
import { dbConnect } from "@/lib/db";
import isAuthenticated from "@/middlewares/auth";
import isAdmin from "@/middlewares/isAdmin";

export default async function handler(req, res) {
    await dbConnect();

    const { id } = req.query;

    if (!id || typeof id !== "string" || id === "undefined") {
        return res.status(400).json({ error: "Invalid or missing product ID" });
    }
    if (req.method === "GET") {
        return getProduct(req, res, id);
    } else if (req.method === "DELETE") {
        await isAuthenticated(req, res, async () => {
            await isAdmin(req, res, async () => {
                return deleteProduct(req, res, id);
            });
        });
    } else if (req.method === "PUT") {
        await isAuthenticated(req, res, async () => {
            await isAdmin(req, res, async () => {
                return updateProduct(req, res, id);
            });
        });
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
