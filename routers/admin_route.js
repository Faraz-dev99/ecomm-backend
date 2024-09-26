const express=require('express');
const admin=require('../controllers/admin-controller.js');
const {authorization, isAdmin}=require('../middleware/auth')
const router=express.Router();

router.get('/users',authorization,isAdmin,admin.getAllUsers);
router.post('/delete/:id',authorization,isAdmin,admin.deleteUser);

module.exports=router;