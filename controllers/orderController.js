import Order from "@/models/Order";
import Product from "@/models/Product";
import mongoose from "mongoose";

//================== get all  Orders =====================//
export const getAllOrders = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user._id;

        let orders;
        if (userRole === "admin") {
            //=========== Admin can access all orders ============//
            orders = await Order.find({})
                .sort({ createdAt: -1 })
                .populate("user_id", "username email phone address image")
                .populate("orderItems.product_id", "images name unit");
        } else {
            //====== Regular user can only access their own orders ======//
            orders = await Order.find({ user_id: userId })
                .sort({ createdAt: -1 })
                .populate("user_id", "username email phone address image")
                .populate("orderItems.product_id", "images name unit");
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
        const { orderItems, deliveryDetails, language } = req.body;

        if (!req.user?._id) {
            return res.status(401).json({ error: "Please sign in to place an order" });
        }

        if (!Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ error: "Missing order details" });
        }

        const requiredDeliveryFields = [
            "name",
            "phone",
            "address",
            "district",
            "thana",
        ];
        if (
            !deliveryDetails ||
            requiredDeliveryFields.some(
                (field) =>
                    typeof deliveryDetails[field] !== "string" ||
                    !deliveryDetails[field].trim()
            )
        ) {
            return res.status(400).json({ error: "Missing delivery details" });
        }

        if (language && !["en", "bn"].includes(language)) {
            return res.status(400).json({ error: "Invalid language" });
        }

        const normalizedItems = [];
        for (const item of orderItems) {
            const quantity = Number(item.cartQuantity);
            if (
                !mongoose.Types.ObjectId.isValid(item.product_id) ||
                !Number.isInteger(quantity) ||
                quantity < 1
            ) {
                return res.status(400).json({ error: "Invalid order item" });
            }
            normalizedItems.push({
                product_id: item.product_id,
                cartQuantity: quantity,
            });
        }

        const productIds = normalizedItems.map((item) => item.product_id);
        const products = await Product.find({ _id: { $in: productIds } });
        if (products.length !== new Set(productIds.map(String)).size) {
            return res.status(400).json({ error: "One or more products were not found" });
        }

        const productsById = new Map(
            products.map((product) => [product._id.toString(), product])
        );
        const normalizedOrderItems = normalizedItems.map((item) => {
            const product = productsById.get(item.product_id.toString());
            const locale = language === "bn" ? "bn" : "en";
            return {
                product_id: product._id,
                name: product.name[locale] || product.name.en,
                price: product.price,
                discount: product.discount,
                unit: product.unit[locale] || product.unit.en,
                cartQuantity: item.cartQuantity,
            };
        });

        const deliveryCharge = 150;
        const subtotal = normalizedOrderItems.reduce(
            (total, item) => total + item.price * item.cartQuantity,
            0
        );
        const tran_id = `TXN-${Date.now()}-${Math.floor(
            Math.random() * 100000
        )}`;

        const order = await Order.create({
            user_id: req.user._id,
            deliveryDetails: {
                name: deliveryDetails.name.trim(),
                phone: deliveryDetails.phone.trim(),
                address: deliveryDetails.address.trim(),
                district: deliveryDetails.district.trim(),
                thana: deliveryDetails.thana.trim(),
                note: typeof deliveryDetails.note === "string"
                    ? deliveryDetails.note.trim()
                    : "",
            },
            tran_id,
            deliveryCharge,
            totalAmount: subtotal + deliveryCharge,
            orderItems: normalizedOrderItems,
            paymentMethod: "cod",
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
