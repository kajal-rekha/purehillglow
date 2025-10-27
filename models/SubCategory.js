import mongoose from "mongoose";

const Schema = mongoose.Schema;
const SubCategorySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },

        image: {
            type: String,
            required: true,
        },

        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.SubCategory ||
    mongoose.model("SubCategory", SubCategorySchema);
