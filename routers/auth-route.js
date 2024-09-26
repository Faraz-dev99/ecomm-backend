const express=require('express');
const auth=require('../controllers/auth-controller');

const {authorization}=require('../middleware/auth')
const router=express.Router();


    
router.get('/',authorization,auth.home);
router.post('/register',auth.register);
router.route('/verify').post(auth.verifyUser)
router.route('/login').post(auth.login);


module.exports=router;