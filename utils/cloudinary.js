const cloudinary=require('cloudinary').v2;
const fs=require('fs');

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

exports.uploadOnCloudnary=async (localfile,folderpath,publicId)=>{
    try{
        if(!localfile) return null;
        const filePath = localfile.path; 
        const response=await cloudinary.uploader.upload(
            filePath,{
                resource_type:'auto',
                folder:folderpath,
                public_id:publicId
            }
        )

       // console.log("file uploaded successfully \n",response);
        return response;
    }
    catch(err){
        fs.unlinkSync(localfile);
        return null;
    }
}

