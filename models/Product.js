import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ProductSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },

        images: {
            type: [String],
            required: true,
        },

        description: {
            type: String,
            required: true,
        },
        benefits: {
            type: [String],
            default: [],
        },
        ingredients: {
            type: [String],
            default: [],
        },
        usage: {
            type: [String],
            required: true,
        },
        price: {
            type: String,
            required: true,
        },
        origin: {
            type: String,
            required: true,
        },
        discount: {
            type: Number,
            default: 0,
        },
        unit: {
            type: String,
            required: true,
        },
        stock: {
            type: Number,
            default: 0,
        },

        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        subcategory_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
            required: true,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

export default mongoose.models.Product ||
    mongoose.model("Product", ProductSchema);
