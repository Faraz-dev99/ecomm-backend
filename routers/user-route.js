const express=require('express');
const {authorization}=require('../middleware/auth')
const {getUser, trythis, updateProfilePicture}=require('../controllers/user-controller');
const {upload}=require('../middleware/multerUpload')

const router=express.Router();


router.get('/getUser',authorization,getUser)
router.post('/updateProfilePicture',authorization,upload.single('profilePicture'),updateProfilePicture)

module.exports=router;