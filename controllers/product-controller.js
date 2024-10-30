const Product = require('../models/product-model');
const Attributes = require('../models/attributes-model')
const User = require('../models/user-model');
const path = require('path');
const Category = require('../models/category-model');
const { uploadOnCloudnary, destroyImage } = require('../utils/cloudinary')
const fs = require('fs');



//edit attribute
exports.editAttribute=async (req,resp)=>{
    try{
        const {attributeId,type}=req.body;
        
        const attribute=await Attributes.findById(attributeId);
        if(!attribute){
            return resp.status(301).json({
                success:false,
                message:"attribute not found"
            })
        }
        attribute.type=type;
        await attribute.save();

        resp.status(300).json({
            success:true,
            attribute
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



//edit product

exports.updateProduct = async (req, resp) => {
    try {
        const { productId } = req.body;
        const updates = req.body;
        console.log(req.body)
        

        const product = await Product.findById(productId);
        if (!product) {
            return resp.status(404).json({
                success: false,
                message: "product not found"
            })
        }




        /*  if(updates['color']){
          updates['color'].split(',');
          updates['color'].map((e)=>{
              return {
                  name:e
              }
          })
         } */

        if (req.files && req.files.length > 0) {
            const files = req.files.filter((file) => file);
        if (files.length < 4) {
            return resp.status(404).json({
                success: false,
                message: "missing files at least 4 image file required",
            })
        }
            console.log("enter")
            const oldImagePublicIds = product.images.map(image => image?.public_id).filter(id => id);
            const uploadfiles = async (files) => {
                const upload = await Promise.all(
                    files.map((file => {
                        const publicId = file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
                        return uploadOnCloudnary(file, 'Mern Practice/E com project(1)/images', publicId);
                    }))
                )
                files.forEach(file => fs.unlinkSync(file.path));
                return upload.map((file) => ({ public_id: file.public_id, secure_url: file.secure_url }));
            }
            const uploadedFiles = await uploadfiles(files);
            product.images = uploadedFiles;
            // Destroy old images if they exist
             // Destroy old images if they exist
             if (oldImagePublicIds.length) {
                await Promise.all(oldImagePublicIds.map(id => destroyImage(id)));
            }

        }

        for (const key of Object.keys(updates)) {
            if (key !== "images") {  // Skip images field since it's handled separately
                if (key === "sizes" || key==="color") {
                    product[key] = JSON.parse(updates[key]);  // Parse JSON string for sizes
                } else {
                    product[key] = updates[key];  // Assign other update fields
                }
            }
        }
        

        await product.save();

        const updatedProduct=await Product.findById(productId).populate("category").populate({
            path:"seller",
            select:"-password"
        }).populate("attributes")
        
        resp.status(300).json({
            success:true,
            updatedProduct
        })


    }
    catch (err) {
        resp.status(500).json({
            success: false,
            message: "something went wrong",
            error: err.message
        });
    }
}


//create product-- 'Admin'

exports.createProduct = async (req, resp) => {
    try {


        const { category: _category, sizes: _sizes,color:_color } = req.body;
        
        const sizes = _sizes ? JSON.parse(_sizes) : [];
        const color=_color?JSON.parse(_color):[];

        const categoryId = await Category.findById(_category);
        /* const cloudinary=await uploadOnCloudnary(req.file);
          console.log("link",cloudinary) */
        const files = req.files.filter((file) => file);
        if (files.length < 4) {
            return resp.status(404).json({
                success: false,
                message: "missing files at least 4 image file required",
            })
        }
        const uploadfiles = async (files) => {
            const upload = await Promise.all(
                files.map((file => {
                    const publicId = file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
                    return uploadOnCloudnary(file, 'Mern Practice/E com project(1)/images', publicId);
                }))
            )
            files.forEach(file => fs.unlinkSync(file.path));
            return upload.map((file) => ({ public_id: file.public_id, secure_url: file.secure_url }));
        }

        const uploadedFile = await uploadfiles(files);
        //console.log("file: ",uploadedFile)


        if (!categoryId) {
            return resp.status(301).json({
                success: false,
                message: "category id not found"
            })
        }




        const product = new Product({
            ...req.body,
            sizes: sizes,
            category: _category,
            color: color,
            images: uploadedFile
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

exports.productStatus = async (req, resp) => {
    try {
        const { status, productId } = req.body;
        if (status === "Draft" || status === "Published") {

            const updateStatus = await Product.findByIdAndUpdate(
                productId,
                {
                    $set: { status: status },
                },
                { new: true }
            )
            if (!updateStatus) {
                return resp.status(301).json({
                    success: false,
                    message: "invalid id or field"
                })
            }

            resp.status(300).json({
                success: true,
                updateStatus
            })

        }
        else {
            return resp.status(301).json({
                success: false,
                message: "invalid status"
            })
        }
    }
    catch (err) {
        resp.status(301).json({
            success: false,
            message: "something went wrong",
            error: err.message
        })
    }
}

//add attributes

exports.createAttributes = async (req, resp) => {
    try {
        const { type, productId } = req.body;
        let attributes = {
            type: type
        }
        const attributesData = new Attributes(attributes);
        console.log("attributes", type);
        console.log(attributesData)
        if (!attributesData || !productId) {
            return resp.status(301).json({
                success: false,
                message: "missing properties",
            })
        }
        attributesData.save();


        const productDetails = await Product.findByIdAndUpdate(
            productId,
            {
                $set: { attributes: attributesData._id }
            },
            { new: true }
        ).populate({
            path: 'attributes'
        })
        //console.log(productDetails)
        if (!productDetails) {
            return resp.status(301).json({
                success: false,
                message: "invalid id or property"
            })
        }

        resp.status(300).json({
            success: true,
            productDetails
        })
    }
    catch (err) {
        resp.status(301).json({
            success: false,
            message: "somwthing went wrong",
            error: err.message
        })
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

exports.getProductDetails = async (req, resp) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id).populate({
            path: 'attributes',
        }).populate({
            path: 'seller',
            select: '-password'
        });
        if (!product) {
            return resp.status(404).json({
                success: false,
                message: "product not found"
            })
        }
        resp.status(200).json({
            success: true,
            product
        })
    }
    catch (err) {
        resp.status(301).json({
            success: false,
            message: "something went wrong",
            error: err.message
        })
    }
}



/* //search products without category(seprete collection reference)

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
 */

//search product with category(separete collection refrence)
exports.getSearchedProducts = async (req, resp) => {
    try {
        const key = req.params.key;

        const findProduct = await Product.aggregate([
            {
                $lookup: {
                    from: 'categories', // Name of the Category collection
                    localField: 'category', // Field in Product referencing Category
                    foreignField: '_id', // Field in Category model
                    as: 'categoryDetails' // Alias for joined data
                }
            },
            {
                $unwind: {
                    path: "$categoryDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $or: [
                        { name: { $regex: key, $options: "i" } },
                        { brand: { $regex: key, $options: "i" } },
                        { 'categoryDetails.name': { $regex: key, $options: "i" } } // Match category name
                    ]
                }
            }
        ]);

        if (findProduct.length === 0) {
            return resp.status(404).json({
                message: "product not found"
            });
        }

        return resp.status(200).json({
            success: true,
            products: findProduct,
            message: "product found"
        });
    } catch (err) {
        return resp.status(500).json({
            success: false,
            message: "something went wrong",
            error: err.message
        });
    }
};


//get seller products

exports.getSellerProducts = async (req, resp) => {
    try {
        const id = req.user._id;
        console.log(id)
        const products = await Product.find({
            seller: id
        }).populate("category");
        if (!products || products.length === 0) {
            return resp.status(300).json({
                success: false,
                message: "product not found"
            })
        }
        console.log(products)
        return resp.status(300).json({
            success: true,
            data: products
        });
    }
    catch (err) {
        resp.status(500).json({
            success: false,
            message: "something went wrong",
            error: err.message
        })
    }
}


//delete Product 
exports.deleteProduct = async (req, resp) => {
    try {
        const id = req.params.id;
        const response = await Product.findById(id);
        if (!response) {
            return resp.status(301).json({
                success: false,
                message: "failed to delete producdt"
            })
        }
        /* if(response.attributes?.type.length<1){
            const attributeId=response.attributes._id;
            const deleteAttribute=await Attributes.findByIdAndDelete(attributeId);
            if(!deleteAttribute){
                return resp.status(301).json({
                    success:false,
                    message:"failded to delete attributes of this product"
                })
            }
        } */
        await Product.findByIdAndDelete(id);
        return resp.status(300).json({
            success: true,
            response,
            message: "product delete successfully"
        })
    }
    catch (err) {
        return resp.status(301).json({
            success: false,
            message: "something went wrong",
            error: err.message
        })
    }
}
