const User=require('../models/user-model');



exports.getUser=async (req,resp)=>{
    try{

        const id=req.user._id;
        const user=await User.findById(id);
        if(!user){
            return resp.status(404).json({
                success:false,
                message:"user not found"
            })
        }
        resp.status(200).json({
            success:true,
            user,
        })
    
        }
        catch(err){
            resp.status(500).json({
                success:false,
                message:"something went wrong",
                error:err.message
            }
            )
        }
}