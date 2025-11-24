import { createUser, getAllUsers } from "@/controllers/userController";
import { dbConnect } from "@/lib/db";
import isAuthenticated from "@/middlewares/auth";
import isAdmin from "@/middlewares/isAdmin";

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === "POST") {
        return createUser(req, res);
    } else if (req.method === "GET") {
        await isAuthenticated(req, res, async () => {
            await isAdmin(req, res, async () => {
                return getAllUsers(req, res);
            });
        });
    } else {
        res.setHeader("Allow", ["GET", "POST"]);
        return res
            .status(405)
            .json({ error: `Method ${req.method} not allowed` });
    }
}
