const express=require("express");
const { authorization } = require("../middleware/auth");
const { createOrder, getMyOrders, cancelOrder, getSellerOrders, updateOrderStatus } = require("../controllers/order-controller");

const router=express.Router();

router.post("/createOrder",authorization,createOrder)
router.get("/getMyOrders",authorization,getMyOrders)
router.post("/cancelOrder",authorization,cancelOrder)
router.get("/getSellerOrders",authorization,getSellerOrders)
router.post("/updateOrderStatus",authorization,updateOrderStatus);


module.exports=router;