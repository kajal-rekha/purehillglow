import { dbConnect } from "@/lib/db";

export default async function handler(req, res) {
    await dbConnect();
    res.status(200).json({ message: "DB Connected Test " });
}
