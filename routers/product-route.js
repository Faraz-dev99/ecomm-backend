const express=require('express');
const {getAllProducts,createProduct, getSearchedProducts,getProductDetails}=require('../controllers/product-controller');
const {authorization, isSeller, isAdmin, isAdminOrSeller}=require('../middleware/auth');
const { createCategory, getAllCategory } = require('../controllers/category-controller');
const {upload}=require('../middleware/multerUpload')

const router=express.Router();

router.get('/getProducts',getAllProducts);
router.post('/new',authorization,isAdminOrSeller,upload.array('images'),createProduct);
router.get('/:id',getProductDetails);


//category

router.post('/createCategory',authorization,isAdminOrSeller,createCategory);
router.get('/getAllCategory',authorization,isAdminOrSeller,getAllCategory);
router.get('/searchProduct/:key',authorization,getSearchedProducts);


module.exports=router;