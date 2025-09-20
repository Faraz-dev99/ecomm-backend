const Review = require("../models/review-model");
const Product = require("../models/product-model");
const Order = require("../models/order-model");

// ✅ Create review
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id;

    // Check if user bought this product
    const order = await Order.findOne({
      customer: userId,
      product: productId, // if your order stores multiple items
    });

    if (!order) {
      return res.status(403).json({ success: false, message: "You must buy this product first" });
    }

    // Check if already reviewed
    const alreadyReviewed = await Review.findOne({ user: userId, product: productId });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: "You already reviewed this product" });
    }

    // Create review
    const review = await Review.create({
      user: userId,
      product: productId,
      name: req.user.username || req.user.name,
      rating: Number(rating),
      comment
    });

    // Push review into product
    const product = await Product.findById(productId);
    product.reviews.push(review._id);
    await product.save();

    res.json({ success: true, message: "Review added successfully", review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//Get reviews of a product (with overall rating)
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params; // assuming GET with params
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const product = await Product.findById(productId).populate("reviews.user", "username");
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

     const reviews = await Review.find({ product: productId }).populate("user", "username profilePicture");

    // calculate stats
    const totalReviews = reviews.length;
    const averageRating =
  totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / totalReviews).toFixed(1)
    : 0;


    const distribution = [0, 0, 0, 0, 0]; // index 0 = 1 star, index 4 = 5 star
    reviews.forEach((r) => {
      distribution[r.rating - 1] += 1;
    });

    res.json({
      success: true,
      reviews,
      averageRating: totalReviews > 0 ? Number(averageRating) : 0,
      totalReviews,
      distribution,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
