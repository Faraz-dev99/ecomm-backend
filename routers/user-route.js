const express=require('express');
const {authorization}=require('../middleware/auth')
const {getUser, trythis}=require('../controllers/user-controller');

const router=express.Router();


router.get('/getUser',authorization,getUser)

module.exports=router;