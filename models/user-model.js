const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Visitor', 'Seller', 'Admin'],
        default: 'Visitor'
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products'
        },
    ],
    profilePicture: {
        public_id: {
            type: String,
        },
        secure_url: {
            type: String,
        }
    }

})

const User = mongoose.model('users', userSchema);
module.exports = User;
