const User = require("../models/user-model");
const Product = require("../models/product-model");
const Order=require("../models/order-model");


exports.createOrder = async (req, res) => {
    try {
        const { orderProducts, address } = req.body;
        const userId = req.user._id;

        if (!orderProducts || !address) {
            return res.status(400).json({
                success: false,
                message: "missing fields"
            })
        }
        let createdOrders = [];

        for (const orderProduct of orderProducts) {
            const { productId, quantity, color, size } = orderProduct;
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }

            if (product.seller.toString() === userId.toString()) {
                return res.status(400).json({ success: false, message: "You cannot buy your own product" });
            }
            console.log("quantity",quantity)
            if (product.stock < quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            }

            //update stock
            product.stock -= quantity;
            await product.save();

            const order = await Order.create({
                customer: userId,
                seller: product.seller,
                product: product._id,
                quantity,
                color,
                size,
                orderPrice: product.price * quantity,
                address
            });

            await User.findByIdAndUpdate(userId, { $push: { orders: order._id } });

            createdOrders.push(order);
        }
        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orders: createdOrders
        });
    }
    catch (error) {
        console.error("CreateOrder Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        const orders = await Order.find({ customer: userId })
            .populate("product")
            .populate("seller", "username email");

        return res.status(200).json({ success: true, orders });

    } catch (error) {
        console.error("getMyOrders Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.getSellerOrders = async (req, res) => {
    try {
        const userId = req.user._id;

        const orders = await Order.find({ seller: userId })
            .populate("product")
            .populate("customer", "username email");

        return res.status(200).json({ success: true, orders });

    } catch (error) {
        console.error("getSellerOrders Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status,orderId } = req.body;
        const userId = req.user._id;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Only seller of product or admin can update
        if (order.seller.toString() !== userId.toString() && req.user.role !== "Admin") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        order.status = status;
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated",
            order
        });
    } catch (error) {
        console.error("updateOrderStatus Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

//  Cancel Order (Customer only → deletes order)
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user._id;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Only customer who created the order can delete it
        if (order.customer.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await Order.findByIdAndDelete(orderId);

        // remove from user's orders array
        await User.findByIdAndUpdate(userId, { $pull: { orders: orderId } });

        return res.status(200).json({
            success: true,
            message: "Order cancelled and deleted successfully"
        });
    } catch (error) {
        console.error("cancelOrder Error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};