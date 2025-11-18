import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    await dbConnect();
    if (req.method === "POST") {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email and password are required" });
        }

        try {
            const user = await User.login(email, password);

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.status(200).json({ message: "Login successful", token, user });
        } catch (error) {
            console.error("Login Error:", error.message);
            res.status(400).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
