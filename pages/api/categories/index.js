import {
    createCategory,
    getAllCategories,
} from "@/controllers/categoryController";
import { dbConnect } from "@/lib/db";

export default async function handler(req, res) {
    await dbConnect();
    
    if (req.method === "GET") {
        return getAllCategories(req, res);
    } else if (req.method === "POST") {
        return createCategory(req, res);
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
