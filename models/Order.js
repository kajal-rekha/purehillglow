import mongoose from "mongoose";
const Schema = mongoose.Schema;

const DeliveryDetailsSchema = new Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        district: { type: String, required: true },
        thana: { type: String, required: true },
        note: { type: String, default: "" },
    },
    { _id: false }
);

const OrderSchema = new Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        deliveryDetails: {
            type: DeliveryDetailsSchema,
            required: true,
        },

        tran_id: {
            type: String,
            required: true,
            unique: true,
        },

        deliveryCharge: {
            type: Number,
            required: true,
            default: 150,
        },

        totalAmount: {
            type: Number,
            required: true,
        },

        orderItems: [
            {
                product_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },

                price: {
                    type: Number,
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

                cartQuantity: {
                    type: Number,
                    required: false,
                },
            },
        ],

        orderStatus: {
            type: String,
            enum: ["pending", "cancelled", "processing", "delivered"],
            default: "pending",
        },

        paymentMethod: {
            type: String,
            enum: ["bkash", "cod"],
            default: "cod",
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "unpaid"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
