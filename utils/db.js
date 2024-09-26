const mongoose=require('mongoose');

const connectdb=async ()=>{
    try{
        await mongoose.connect(process.env.DBHOST);
        console.log("connted")
    }
    catch(err){
        console.log("connection failed");
    }
      
}

module.exports=connectdb;