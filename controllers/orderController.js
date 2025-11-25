import Order from "@/models/Order";

//================== get all  Orders =====================//
export const getAllOrders = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user._id;

        let orders;
        if (userRole === "admin") {
            //=========== Admin can access all orders ============//
            orders = await Order.find({}).populate(
                "user_id",
                "username email phone address image"
            );
        } else {
            //====== Regular user can only access their own orders ======//
            orders = await Order.find({ user_id: userId }).populate(
                "user_id",
                "username email phone address image"
            );
        }

        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: "No orders found" });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

//================== get an  Order =====================//
export async function getAnOrder(req, res) {
    try {
        const { id } = req.query;
        const order = await Order.findById(id).populate(
            "user_id",
            "username email phone address image"
        );
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json(order);
    } catch (err) {
        console.error("Error in getAnOrder:", err.message);
        res.status(500).json({ error: "Failed to fetch order" });
    }
}

//================== Update Order =====================//
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.query;
        const updates = req.body;

        const validStatus = [
            "pending",
            "completed",
            "cancelled",
            "processing",
            "delivered",
        ];
        const validPaymentStatus = ["pending", "paid", "failed", "unpaid"];

        if (updates.orderStatus && !validStatus.includes(updates.orderStatus)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        if (
            updates.paymentStatus &&
            !validPaymentStatus.includes(updates.paymentStatus)
        ) {
            return res
                .status(400)
                .json({ error: "Invalid payment status value" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        ).populate("user_id", "username email phone address image");

        if (!updatedOrder) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({
            message: "order updated successfully",
            updatedOrder,
        });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ error: "Server error occurred" });
    }
};

//=================== Delete Order ========================//
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.query;
        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.status(200).json({ message: "Order deleted successfully" ,order});
    } catch (error) {
        console.error("[OrderController] Error deleting order:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const placeOrder = async (req, res) => {
    try {
        const { user_id, orderItems, totalAmount, paymentMethod } = req.body;

        if (!user_id || !orderItems || orderItems.length === 0) {
            return res.status(400).json({ error: "Missing order details" });
        }

        const tran_id = `TXN-${Date.now()}-${Math.floor(
            Math.random() * 100000
        )}`;

        const order = await Order.create({
            user_id,
            tran_id,
            orderItems,
            totalAmount,
            paymentMethod,
            paymentStatus: "pending",
            orderStatus: "pending",
        });

        res.status(201).json({
            message: "Order placed successfully",
            order,
        });
    } catch (error) {
        console.error("Order creation error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
