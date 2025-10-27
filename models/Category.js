import mongoose from "mongoose";

const Schema = mongoose.Schema;
const CategorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },

        image: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Category ||
    mongoose.model("Category", CategorySchema);
