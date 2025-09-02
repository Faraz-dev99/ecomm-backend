const mongoose = require('mongoose');

const orderSchema=new mongoose.Schema({
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products",
        required:true
    }
})