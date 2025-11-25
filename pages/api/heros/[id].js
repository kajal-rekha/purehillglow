import { deleteHero, getHero, updateHero } from "@/controllers/heroController";
import { dbConnect } from "@/lib/db";
import isAuthenticated from "@/middlewares/auth";
import isAdmin from "@/middlewares/isAdmin";

export default async function handler(req, res) {
    await dbConnect();

    const { id } = req.query;

    if (req.method === "GET") {
        return getHero(req, res, id);
    } else if (req.method === "DELETE") {
        try {
            await isAuthenticated(req, res, async () => {
                await isAdmin(req, res, async () => {
                    await deleteHero(req, res, id);
                });
            });
        } catch (error) {
            console.error("Error deleting hero section:", error);
            return res
                .status(500)
                .json({ error: "Failed to delete hero section" });
        }
    } else if (req.method === "PUT") {
        try {
            await isAuthenticated(req, res, async () => {
                await isAdmin(req, res, async () => {
                    await updateHero(req, res);
                });
            });
        } catch (error) {
            console.error("Error updating hero section:", error);
            return res
                .status(500)
                .json({ error: "Failed to update hero section" });
        }
    } else {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
}
