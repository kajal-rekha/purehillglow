import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === "POST") {
        const { username, email, password, image, address, phone } = req.body;

        try {
            const user = await User.signup(
                username,
                email,
                password,
                image,
                address,
                phone
            );

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.status(201).json({
                message: "User registered successfully",
                user,
                token,
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
