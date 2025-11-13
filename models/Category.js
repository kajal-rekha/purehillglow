import mongoose from "mongoose";

const Schema = mongoose.Schema;
const CategorySchema = new Schema(
    {
        name: {
            en: {
                type: String,
                required: true,
            },
            bn: {
                type: String,
                required: true,
            },
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
