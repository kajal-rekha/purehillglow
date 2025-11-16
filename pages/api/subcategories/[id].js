import {
    deleteSubcategory,
    getASubcategory,
    updateSubcategory,
} from "@/controllers/subCategoryController";
import { dbConnect } from "@/lib/db";

export default async function handler(req, res) {
    await dbConnect();

    const { id } = req.query;

    if (req.method === "GET") {
        return getASubcategory(req, res, id);
    } else if (req.method === "DELETE") {
        return deleteSubcategory(req, res, id);
    } else if (req.method === "PUT") {
        return updateSubcategory(req, res, id);
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
