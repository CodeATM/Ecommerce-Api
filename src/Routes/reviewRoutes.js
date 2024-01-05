// routes.js
const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../Middleware/verification");
const {createReview, getProductReviews, editProductReview, deleteProductReview} = require("../Controllers/products/ReviewsController");

router.post("/createReview/:id", verifyJWT, createReview);
router.get("/getReview/:id", verifyJWT, getProductReviews);
router.post("/updateReview/:id", verifyJWT, editProductReview);
router.delete("/deleteReview/:id", verifyJWT, deleteProductReview);

module.exports = router;
