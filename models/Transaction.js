import mongoose from "mongoose";
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
    {
        tran_id: {
            type: String,
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            required: true,
        },

        date: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Transaction ||
    mongoose.model("Transaction", transactionSchema);
