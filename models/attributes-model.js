const mongoose = require('mongoose');

const attributesSchema = new mongoose.Schema({
        type: [
            {
                name: { type: String },    // Optional attribute name (e.g., Size, Color)
                values: [], // Optional attribute values (e.g., XL, Red)
            },
        ],
    // If no attributes are provided, this will store an empty array. 
}, { timestamps: true })

module.exports = mongoose.model('attributes', attributesSchema);


