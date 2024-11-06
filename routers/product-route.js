const express=require('express');
const {getAllProducts,createProduct, getSearchedProducts,getProductDetails, createAttributes, productStatus, getSellerProducts, deleteProduct, updateProduct, editAttribute}=require('../controllers/product-controller');
const {authorization, isSeller, isAdmin, isAdminOrSeller}=require('../middleware/auth');
const { createCategory, getCategories} = require('../controllers/category-controller');
const {upload}=require('../middleware/multerUpload')

const router=express.Router();

router.get('/getProducts',getAllProducts);
router.post('/new',authorization,isAdminOrSeller,upload.array('images'),createProduct);
router.get('/details/:id',getProductDetails);
router.post('/deleteProduct/:id',authorization,isAdminOrSeller,deleteProduct);
router.post('/updateProduct',authorization,isAdminOrSeller,upload.array('images'),updateProduct);
router.post('/editAttributes',authorization,isAdminOrSeller,editAttribute)


//attributes
router.post('/createAttributes',authorization,isAdminOrSeller,createAttributes);

//get seller products
router.get('/getSellerProducts',authorization,isAdminOrSeller,getSellerProducts)

//product status --> publish or draft
router.post('/productStatus',authorization,isAdminOrSeller,productStatus)

//category

router.post('/createCategory',authorization,isAdminOrSeller,createCategory);
router.get('/getCategories',getCategories);
router.get('/searchProduct/:key',getSearchedProducts);


module.exports=router;