const Product = require('../models/product-model');
const Attributes=require('../models/attributes-model')
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
        //console.log("file: ",uploadedFile)
        

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




            //console.log("udpate", updateseller)
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

//product status change -- publish or draft product 

exports.productStatus=async (req,resp)=>{
    try{
        const {status,productId}=req.body;
        if(status==="Draft" || status==="Published"){
        
        const updateStatus=await Product.findByIdAndUpdate(
            productId,
            {
                $set:{status:status},
            },
            {new:true}
        )
        if(!updateStatus){
            return resp.status(301).json({
                success:false,
                message:"invalid id or field"
            })
        }

        resp.status(300).json({
            success:true,
            updateStatus
        })

    }
    else{
        return resp.status(301).json({
            success:false,
            message:"invalid status"
        })
    }
    }
    catch(err){
        resp.status(301).json({
            success:false,
            message:"something went wrong",
            error:err.message
        })
    }
}

//add attributes

exports.createAttributes=async (req,resp)=>{
    try{
        const {type,productId}=req.body;
        let attributes={
            type:type
        }
        const attributesData=new Attributes(attributes);
        console.log("attributes",type);
        console.log(attributesData)
        if(!attributesData || !productId){
           return resp.status(301).json({
                success:false,
                message:"missing properties",
            })
        }
        attributesData.save();
        

        const productDetails=await Product.findByIdAndUpdate(
            productId,
            {
                $set:{attributes:attributesData._id}
            },
            {new:true}
        ).populate({
            path:'attributes'
        })
        //console.log(productDetails)
        if(!productDetails){
            return resp.status(301).json({
                success:false,
                message:"invalid id or property"
            })
        }

        resp.status(300).json({
            success:true,
            productDetails
        })
    }
    catch(err){
        resp.status(301).json({
            success:false,
            message:"somwthing went wrong",
            error:err.message
        })
    }
}


//edit product

exports.editProduct=async (req,resp)=>{
    const {productId}=req.body;
    const updates=req.body;
    const product=await Product.findById(productId);

    if(req.files){
        const files= req.files.filter((file)=>file);
        const upload =await Promise.all(
            files.map((file => {
                const publicId ="";
                return uploadOnCloudnary(file,'Mern Practice/E com project(1)/images',publicId);
            }))
        )
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

