const mongoose=require('mongoose');

const reviewSchema=new mongoose.Schema({
    reviews:[
        { 
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'users'
            },
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'products'
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true,
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
},{timestamps:true})

module.exports=mongoose.model('reviews',reviewSchema);
