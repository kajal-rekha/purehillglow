import Order from "@/models/Order";
import Payment from "@/models/Payment";

//==================== Create Payment ==================//
export const createPayment = async (req, res) => {
    try {
        const { order_id, tran_id, amount, paymentMethod, status } = req.body;

        if (!order_id || !tran_id || !amount) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // ==========payment creation==========//
        const payment = await Payment.create({
            order_id,
            tran_id,
            amount,
            paymentMethod,
            status: status || "pending",
        });

        //  ============order paymentStatus automatically Update============//
        const paymentStatus = payment.status === "paid" ? "paid" : "pending";
        await Order.findByIdAndUpdate(order_id, { paymentStatus });

        res.status(201).json({
            message: "Payment created and order updated successfully",
            payment,
        });
    } catch (error) {
        console.error("Error creating payment:", error);
        res.status(500).json({ error: error.message });
    }
};

//==================== Get All Payment ===================//
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate("order_id", "user_id totalAmount orderStatus")
            .sort({ createdAt: -1 });

        res.status(200).json(payments);
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ error: error.message });
    }
};

//==================== Get Single Payment =================//
export const getAPayment = async (req, res) => {
    try {
        const { id } = req.query;

        const payment = await Payment.findById(id).populate(
            "order_id",
            "user_id totalAmount orderStatus"
        );

        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }

        res.status(200).json(payment);
    } catch (error) {
        console.error("Error fetching payment:", error);
        res.status(500).json({ error: error.message });
    }
};

//==================== Update Payment ===================//
export const updatePayment = async (req, res) => {
    try {
        const { id } = req.query;
        const updates = req.body;

        const payment = await Payment.findByIdAndUpdate(id, updates, {
            new: true,
        });
        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }

        if (updates.status === "paid") {
            await Order.findByIdAndUpdate(payment.order_id, {
                paymentStatus: "paid",
            });
        }

        res.status(200).json({
            message: "Payment updated successfully",
            payment,
        });
    } catch (error) {
        console.error("Error updating payment:", error);
        res.status(500).json({ error: error.message });
    }
};

//==================== Delete Payment =====================//
export const deletePayment = async (req, res) => {
    try {
        const { id } = req.query;

        const payment = await Payment.findByIdAndDelete(id);

        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }

        res.status(200).json({
            message: "Payment deleted successfully",
            payment,
        });
    } catch (error) {
        console.error("Error updating payment:", error);
        res.status(500).json({ error: error.message });
    }
};
