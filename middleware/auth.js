const Jwt=require('jsonwebtoken');
const User = require('../models/user-model');
const authorization=async (req,resp,next)=>{
    try{
        let token=req.headers['authorization'];
     token=req.body.token || token?.replace('berear ',"");
    
        if(!token){
            resp.status(403).send({
                success:false,
                message:"token missing"
            });
        }
        else{
            
            Jwt.verify(token,process.env.JWTKEY,(err,valid)=>{
                if(err){
                   resp.status(401).send({
                       success:false,
                       message:"please provide valid token",
                       error:err.message
                   })
                }
                else{
                    req.user=valid.user;
                   next();
                }
           })
        }
    }
    catch(err){
        resp.status(404).json({
            success:false,
            message:"something went wrong",
            error:err.message
        })
    }
    
}

const isAdmin=async (req,resp,next)=>{
    try{
        
        let token=req.headers['authorization'];
        token=req.body.token || token?.replace('berear ',"");
        if(!token){
            resp.status(403).send("token missing");
        }
        const decode=Jwt.verify(token,process.env.JWTKEY);
        const userdata=decode.user;
        const user=await User.findOne({email:userdata.email})
        if(!user || user.role!=='Admin'){
            return resp.status(301).json({message:'Access Denied'});
        }
    }
    catch(err){
        return resp.status(301).json({
            success:false,
            message:'something went wrong',
            err:err.message
        });
    }
    next();
}

const isVisitor=async (req,resp,next)=>{
    try{
        
        let token=req.headers['authorization'];
        token=req.body.token || token?.replace('berear ',"");
        if(!token){
            resp.status(403).send("token missing");
        }
        const decode=Jwt.verify(token,process.env.JWTKEY);
        const userdata=decode.user;
        const user=await User.findOne({email:userdata.email})
        if(!user || user.role!=='Visitor'){
            return resp.status(301).json({message:'Access Denied'});
        }
    }
    catch(err){
        return resp.status(301).json({
            success:false,
            message:'something went wrong',
            err:err.message
        });
    }
    next();
}

const isSeller=async (req,resp,next)=>{
    try{
        
        let token=req.headers['authorization'];
        token=req.body.token || token?.replace('berear ',"");
        if(!token){
            resp.status(403).send("token missing");
        }
        const decode=Jwt.verify(token,process.env.JWTKEY);
        const userdata=decode.user;
        const user=await User.findOne({email:userdata.email})
        if(!user || user.role!=='Seller'){
            return resp.status(301).json({message:'Access Denied'});
        }
    }
    catch(err){
        return resp.status(301).json({
            success:false,
            message:'something went wrong',
            err:err.message
        });
    }
    next();
}


const isAdminOrSeller = async (req, resp, next) => {
    try {
        let token = req.headers['authorization'];
        token = req.body.token || token?.replace('berear ', '');
        if (!token) {
            return resp.status(403).send("Token missing");
        }
        
        const decode = Jwt.verify(token, process.env.JWTKEY);
        const userdata = decode.user;
        const user = await User.findOne({ email: userdata.email });
        
        if (!user || (user.role !== 'Admin' && user.role !== 'Seller')) {
            return resp.status(301).json({ message: 'Access Denied' });
        }
        
    } catch (err) {
        return resp.status(301).json({
            success: false,
            message: 'Something went wrong',
            err: err.message
        });
    }
    
    next();
}




module.exports={authorization,isVisitor,isSeller,isAdmin,isAdminOrSeller};