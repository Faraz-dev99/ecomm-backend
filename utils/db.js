const mongoose=require('mongoose');

const connectdb=async ()=>{
    try{
        await mongoose.connect('mongodb+srv://arbazuddin242830:un21g32Database@ecommcerce.mtotm.mongodb.net/ecomm?retryWrites=true&w=majority&appName=ecommcerce');
    }
    catch(err){
        console.log("connection failed");
    }
      
}

module.exports=connectdb;