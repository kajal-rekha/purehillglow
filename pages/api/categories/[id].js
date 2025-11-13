import {
    deleteCategory,
    getACategory,
    updateCategory,
} from "@/controllers/categoryController";
import { dbConnect } from "@/lib/db";

export default async function handler(req, res) {
    await dbConnect();

    const { id } = req.query;

    if (req.method === "GET") {
        return getACategory(req, res, id);
    } else if (req.method === "DELETE") {
        return deleteCategory(req, res, id);
    } else if (req.method === "PUT") {
        return updateCategory(req, res, id);
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
