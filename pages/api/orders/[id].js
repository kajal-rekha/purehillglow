import {
    deleteOrder,
    getAnOrder,
    updateOrder,
} from "@/controllers/orderController";
import { dbConnect } from "@/lib/db";
import isAuthenticated from "@/middlewares/auth";
import isAdmin from "@/middlewares/isAdmin";

export default async function handler(req, res) {
    await dbConnect();

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "ID is required" });
    }

    if (req.method === "GET") {
        await isAuthenticated(req, res, async () => {
            return getAnOrder(req, res);
        });
    } else if (req.method === "DELETE") {
        await isAuthenticated(req, res, async () => {
            await isAdmin(req, res, async () => {
                return deleteOrder(req, res);
            });
        });
    } else if (req.method === "PUT") {
        await isAuthenticated(req, res, async () => {
            await isAdmin(req, res, async () => {
                return updateOrder(req, res);
            });
        });
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
