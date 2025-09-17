const express=require("express");
const { authorization } = require("../middleware/auth");
const { createReview, getProductReviews } = require("../controllers/review-controller");

const router=express.Router();

router.post("/createReview",authorization,createReview);
router.get("/getProductReviews/:productId",getProductReviews)


module.exports=router;