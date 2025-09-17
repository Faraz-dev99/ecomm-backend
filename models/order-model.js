const mongoose = require('mongoose');

const orderSchema=new mongoose.Schema({
    customer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    seller:{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products",
        required:true
    },
    quantity:{
        type:Number,
        default:1
    },
    color:{
        type:String
    },
    size:{
        type:String
    },
    orderPrice:{
        type:Number,
        required:true
    },
    address:{
        fullname:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        },
        country:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
        phone:{
            type:Number,
            required:true
        }

    },
    status:{
        type:String,
        enum:["Pending","Ordered","Cancelled","Delivered"],
        default:"Pending"
    }
},{ timestamps: true })

module.exports=mongoose.model("orders",orderSchema);