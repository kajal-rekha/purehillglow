import { createHero, getAllHeros } from "@/controllers/heroController";
import { dbConnect } from "@/lib/db";
import isAuthenticated from "@/middlewares/auth";
import isAdmin from "@/middlewares/isAdmin";

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === "GET") {
        return getAllHeros(req, res);
    } else if (req.method === "POST") {
        try {
            await isAuthenticated(req, res, async () => {
                await isAdmin(req, res, async () => {
                    await createHero(req, res);
                });
            });
        } catch (error) {
            console.error("Error creating hero section:", error);
            return res
                .status(500)
                .json({ error: "Failed to create hero section" });
        }
    } else {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
}