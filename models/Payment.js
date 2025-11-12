import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    transaction_id: String,
    order_id: String,
    amount: Number,
    currency: String,
    user: String,
    items: Array,
    status: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Payment ||
    mongoose.model("Payment", PaymentSchema);
