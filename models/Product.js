import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ProductSchema = new Schema(
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

        images: {
            type: [String],
            required: true,
        },

        description: {
            en: {
                type: String,
                required: true,
            },
            bn: {
                type: String,
                required: true,
            },
        },

        benefits: {
            en: {
                type: [String],
                default: [],
            },
            bn: {
                type: [String],
                default: [],
            },
        },

        ingredients: {
            en: {
                type: [String],
                default: [],
            },
            bn: {
                type: [String],
                default: [],
            },
        },

        usage: {
            en: {
                type: [String],
                required: true,
            },
            bn: {
                type: [String],
                required: true,
            },
        },

        price: {
            type: Number,
            required: true,
        },

        origin: {
            en: {
                type: String,
                required: true,
            },
            bn: {
                type: String,
                required: true,
            },
        },

        discount: {
            type: Number,
            default: 0,
        },

        unit: {
            en: {
                type: String,
                required: true,
            },
            bn: {
                type: String,
                required: true,
            },
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
