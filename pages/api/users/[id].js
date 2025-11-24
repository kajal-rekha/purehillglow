import {
    deleteUser,
    getAnUser,
    updateUser,
} from "@/controllers/userController";
import { dbConnect } from "@/lib/db";
import isAuthenticated from "@/middlewares/auth";
import isAdmin from "@/middlewares/isAdmin";

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === "GET") {
        return getAnUser(req, res);
    } else if (req.method === "PUT") {
        await isAuthenticated(req, res, async () => {
            await isAdmin(req, res, async () => {
                return updateUser(req, res);
            });
        });
    } else if (req.method === "DELETE") {
        await isAuthenticated(req, res, async () => {
            await isAdmin(req, res, async () => {
                return deleteUser(req, res);
            });
        });
    } else {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res
            .status(405)
            .json({ error: `Method ${req.method} not allowed` });
    }
}
