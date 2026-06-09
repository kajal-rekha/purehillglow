
import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(uri);

    console.log("MongoDB Connected");
  } catch (error) {
    console.log("Database connection failed:", error.message);
    throw error;
  }
};

export default dbConnect;