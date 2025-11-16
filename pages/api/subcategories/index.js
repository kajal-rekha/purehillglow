import {
    createSubcategory,
    getAllSubcategories,
} from "@/controllers/subCategoryController";
import { dbConnect } from "@/lib/db";

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === "GET") {
        return getAllSubcategories(req, res);
    } else if (req.method === "POST") {
        return createSubcategory(req, res);
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
