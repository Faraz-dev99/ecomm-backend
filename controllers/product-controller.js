const Product = require('../models/product-model');
const User = require('../models/user-model');
const path=require('path');
const Category = require('../models/category-model');
const { uploadOnCloudnary } = require('../utils/cloudinary')
const fs=require('fs');


//create product-- 'Admin'

exports.createProduct = async (req, resp, next) => {
    try {


        const { category: _category } = req.body;
        let {color}=req.body;
        color=color.split(",");
        color=color.map((e)=>{
            return {
                name:e
            }
        })
        const categoryId = await Category.findById(_category);
        /* const cloudinary=await uploadOnCloudnary(req.file);
          console.log("link",cloudinary) */
        const files = req.files.filter((file)=>file);
        if(files.length<4){
            return resp.status(404).json({
                success:false,
                message:"missing files at least 4 image file required",
            })
        }
        const uploadfiles = async (files) => {
            const upload =await Promise.all(
                files.map((file => {
                    const publicId =file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9)+path.extname(file.originalname)
                    return uploadOnCloudnary(file,'Mern Practice/E com project(1)/images',publicId);
                }))
            )
            files.forEach(file => fs.unlinkSync(file.path));
            return upload.map((file)=>({public_id:file.public_id,secure_url:file.secure_url}));
        }

        const uploadedFile=await uploadfiles(files);
        console.log("file: ",uploadedFile)
        

        if (!categoryId) {
            return resp.status(301).json({
                success: false,
                message: "category id not found"
            })
        }




        const product = new Product({
            ...req.body,
            category: _category,
            color,
            images:uploadedFile
        });



        if (product) {
            await product.save();
            const userId = req.user._id;
            const updateseller = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        products: product._id
                    }
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true
                })




            console.log("udpate", updateseller)
            resp.status(201).json({
                success: true,
                product
            })
        }
        else {
            resp.status(201).json({
                success: false,
                message: "failed"
            });
        }
    }
    catch (err) {
       // files.forEach(file => fs.unlinkSync(file.path));
        resp.status(500).json({
            success: false,
            message: "something went wrong",
            error: err.message
        });
    }

}


//get all product
exports.getAllProducts = async (req, resp) => {
    try {
        const products = await Product.find();

        if (products) {
            resp.status(200).json({
                success: true,
                products
            })
        }
        else {
            resp.status(200).json({
                success: false,
                message: "something went wrong"
            })
        }
    }
    catch (err) {
        resp.status(200).json({
            success: false,
            message: "something went wrong",
            error: err.message
        })
    }

}

//get product details

exports.getProductDetails=async (req,resp)=>{
    try{
        const id=req.params.id;
        const product=await Product.findById(id);
        if(!product){
           return resp.status(404).json({
                success:false,
                message:"product not found"
            })
        }
        resp.status(200).json({
            success:true,
            product
        })
    }
    catch(err){
        resp.status(301).json({
            success:false,
            message:"something went wrong",
            error:err.message
        })
    }
}

//search products

exports.getSearchedProducts = async (req, resp) => {
    try {
        const key = req.params.key;
        console.log(key)
        const findProduct = await Product.find({
            $or: [
                { name: { $regex: key, $options: "i" } },
                { brand: { $regex: key, $options: "i" } }
            ]
        }).populate({
            path: 'category',
            match: { name: { $regex: key, $options: "i" } },
            select: 'name'
        })

        if (findProduct.length === 0) {
            return resp.status(404).json({
                message: "product not found"
            })
        }
        return resp.status(200).json({
            success: true,
            products: findProduct,
            message: "product found"
        })
    }
    catch (err) {
        resp.status(500).json({
            success: false,
            message: "something went wrong",
            error: err.message
        })
    }
}

