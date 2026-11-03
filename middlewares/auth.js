import User from "@/models/User";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    let user;

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = payload.id || payload.userId;
        if (!userId) {
            return res.status(401).json({ error: "Invalid authentication token" });
        }

        user = await User.findById(userId);
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        console.error("Authentication error:", error);
        return res.status(500).json({ error: "Authentication failed" });
    }

    if (!user) {
        return res.status(401).json({ error: "User account not found" });
    }

    req.user = user;
    return next();
};

export default isAuthenticated;
