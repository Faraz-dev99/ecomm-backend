const User = require('../models/user-model');

const getAllUsers=async (req,resp)=>{
    try{
        const users=await User.find();
        resp.send(users)
    }
    catch(err){
        resp.send({
            success:false,
            message:'Access Denied',
            error:err.message
        })
    }
}

const deleteUser=async (req,resp)=>{
   try{
    const userId=req.params.id;
    const checkAdmin=await User.findById(userId);
    
    if(checkAdmin.role==='Admin'){
        return resp.status(401).json({
            success:false,
            message:"you can't delete yourself"
        });
    }
    const user=await User.findByIdAndDelete(userId);
    if(!user){
        return resp.status(401).json({
            success:false,
            message:"user not found"
        });
    }
    resp.send({
        message:'user deleted successfully',
        user
    })
   }
   catch(err){
    resp.send({
        success:false,
        message:"something went wrong",
        error:err.message
    })
   }
}

module.exports={getAllUsers,deleteUser};