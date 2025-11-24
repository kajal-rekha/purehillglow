import {
    deleteSubcategory,
    getASubcategory,
    updateSubcategory,
} from "@/controllers/subCategoryController";
import { dbConnect } from "@/lib/db";
import isAuthenticated from "@/middlewares/auth";
import isAdmin from "@/middlewares/isAdmin";

export default async function handler(req, res) {
    await dbConnect();

    const { id } = req.query;

    if (req.method === "GET") {
        return getASubcategory(req, res, id);
    } else if (req.method === "DELETE") {
        await isAuthenticated(req, res, async () => {
            await isAdmin(req, res, async () => {
                return deleteSubcategory(req, res, id);
            });
        });
    } else if (req.method === "PUT") {
        await isAuthenticated(req, res, async () => {
            await isAdmin(req, res, async () => {
                return updateSubcategory(req, res, id);
            });
        });
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
