import {
    createSubcategory,
    getAllSubcategories,
} from "@/controllers/subCategoryController";
import { dbConnect } from "@/lib/db";
import isAuthenticated from "@/middlewares/auth";
import isAdmin from "@/middlewares/isAdmin";

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === "GET") {
        return getAllSubcategories(req, res);
    } else if (req.method === "POST") {
        await isAuthenticated(req, res, async () => {
            await isAdmin(req, res, async () => {
                return createSubcategory(req, res);
            });
        });
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
