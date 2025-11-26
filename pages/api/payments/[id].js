import {
    deletePayment,
    getAPayment,
    updatePayment,
} from "@/controllers/paymentController";
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
            return getAPayment(req, res);
        });
    } else if (req.method === "DELETE") {
        await isAuthenticated(req, res, async () => {
            await isAdmin(req, res, async () => {
                return deletePayment(req, res);
            });
        });
    } else if (req.method === "PUT") {
        await isAuthenticated(req, res, async () => {
            await isAdmin(req, res, async () => {
                return updatePayment(req, res);
            });
        });
    } else {
        res.status(405).json({ error: "Method Not Allowed" });
    }
}
