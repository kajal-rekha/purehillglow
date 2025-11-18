import {
    deleteUser,
    getAnUser,
    updateUser,
} from "@/controllers/userController";
import { dbConnect } from "@/lib/db";

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === "GET") {
        return getAnUser(req, res);
    } else if (req.method === "PUT") {
        return updateUser(req, res);
    } else if (req.method === "DELETE") {
        return deleteUser(req, res);
    } else {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res
            .status(405)
            .json({ error: `Method ${req.method} not allowed` });
    }
}
