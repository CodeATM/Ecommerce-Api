// routes.js
const express = require("express");
const router = express.Router();
const { verifyJWT, restrictTo } = require("../Middleware/verification");

const {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../Controllers/users/Wishlist");

router.get("/user-wishlist", verifyJWT, getUserWishlist);
router.put("/add-wishlist", verifyJWT, addToWishlist);
router.put("/remove-wishlist", verifyJWT, removeFromWishlist);

module.exports = router;
