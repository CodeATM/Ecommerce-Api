// routes.js
const express = require("express");
const router = express.Router();
const { verifyJWT, restrictTo } = require("../Middleware/verification");
const {createReview, editProductReview,  getProductReviews, deleteProductReview} = require("../Controllers/products/ReviewsController");

router.post("/createReview/:productId", verifyJWT, createReview);
router.get("/:id", verifyJWT, getProductReviews);
router.post("/updateReview/:id", verifyJWT, restrictTo('user', 'admin'), editProductReview);
router.delete("/deleteReview/:id", verifyJWT, deleteProductReview);

module.exports = router;
