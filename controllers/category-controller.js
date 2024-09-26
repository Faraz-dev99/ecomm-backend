const Category=require('../models/category-model');

const createCategory=async (req,resp)=>{
    try{
    const {name}=req.body;
    if(!name){
       return resp.status(301).json({
            success:false,
            message:"invalid category"
        })
    }

    const checkExist=await Category.findOne({name});
    
    if(checkExist?.name===name){
        return resp.status(301).json({
            success:false,
            message:"this category exist already"
        })
    }
    const category=await Category.create({name});
    if(category){
        resp.status(300).json({
            success:true,
            message:"category created successfully"
        })
    }
}
catch(err){
    return resp.send({
        success:false,
        message:"something went wrong",
        error:err.message
    })
}
}

const getAllCategory=async (req,resp)=>{
      try{
          const categories=await Category.find();
          if(categories){
            return resp.status(300).json({
                success:true,
                categories
            })
          }
          return resp.status(301).json({
            success:false,
            message:"failed to fetch categories"
          })
      }
      catch(err){
        return resp.status(301).json({
            success:false,
            message:"something went wrong",
            error:err.message
        })
      }
}


module.exports={createCategory,getAllCategory};