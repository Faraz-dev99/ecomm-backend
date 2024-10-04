const express=require('express');
const {getAllProducts,createProduct, getSearchedProducts,getProductDetails, createAttributes, productStatus}=require('../controllers/product-controller');
const {authorization, isSeller, isAdmin, isAdminOrSeller}=require('../middleware/auth');
const { createCategory, getCategories} = require('../controllers/category-controller');
const {upload}=require('../middleware/multerUpload')

const router=express.Router();

router.get('/getProducts',getAllProducts);
router.post('/new',authorization,isAdminOrSeller,upload.array('images'),createProduct);
router.get('/details/:id',getProductDetails);


//attributes
router.post('/createAttributes',authorization,isAdminOrSeller,createAttributes);

//product status --> publish or draft
router.post('/productStatus',authorization,isAdminOrSeller,productStatus)

//category

router.post('/createCategory',authorization,isAdminOrSeller,createCategory);
router.get('/getCategories',authorization,isAdminOrSeller,getCategories);
router.get('/searchProduct/:key',authorization,getSearchedProducts);


module.exports=router;