import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
    {
        tran_id: {
            type: String,
            required: true,
            unique: true,
        },

        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        currency: {
            type: String,
            default: "BDT",
        },

        paymentMethod: {
            type: String,
            enum: ["bkash", "bank", "cod"],
            default: "cod",
        },

        status: {
            type: String,
            enum: ["pending", "paid", "failed", "unpaid"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.models.Payment ||
    mongoose.model("Payment", PaymentSchema);
