// routes.js
const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../Middleware/verification");
const { addItemToCart,decreaseQuantity, getCart, removeItem, getAllCart} = require("../Controllers/orders/cartController");

// cart Routes
router.post("/addItem", verifyJWT, addItemToCart);
router.post("/removeItem", verifyJWT, removeItem)
router.post("/decreaseQuanity", verifyJWT, decreaseQuantity);
router.get("/cart", verifyJWT, getCart);
router.get("/Allcart", verifyJWT, getAllCart);

// Order routes

module.exports = router;
