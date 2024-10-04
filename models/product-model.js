const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter product name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "please enter product description"]
    },
    brand: {
        type: String,
        required: [true, "plese enter product brand"]
    },
    price: {
        type: Number,
        required: [true, "plese enter product price"],
        maxLength: [8, "price cannot exceed 8 characters"]
    },
    color: [{
        name: {
            type: String,
            required: true
        }
    }],
    ratings: {
        type: Number,
        default: 0
    },
    images: [{
        public_id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    ],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    },
    stock: {
        type: Number,
        required: [true, "please enter product stock"],
        maxLength: [4, "stock cannot exceed 4 characters"],
        default: 1
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default: 'Draft'
    },
    attributes:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'attributes',
    }





}, { timestamps: true });

module.exports = mongoose.model("products", productSchema)