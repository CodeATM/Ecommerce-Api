// routes.js
const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../Middleware/verification");
const {
  createProduct,
  getAllProduct,
  updateProduct,
  getOneProduct,
  deleteProduct,
} = require("../Controllers/products/ProductController");
const {
  addToCart,
  removeFromCart,
} = require("../Controllers/orders/cartController");
const {
  createCollection,
  addProductToCollection,
  removeProductToCollection,
  getCollection,
  deleteCollection,
  updateCollection,
} = require("../Controllers/products/CollectionController");

router.get("/Collection", verifyJWT, getCollection);

// Product Routes
router.post("/createProduct", verifyJWT, createProduct);
router.get("/", getAllProduct);
router.get("/:id", getOneProduct);
router.put("/updateProduct/:id", verifyJWT, updateProduct);
router.delete("/deleteProduct/:id", verifyJWT, deleteProduct);

//cart and order routes
router.post("/addToCart/:productID", verifyJWT, addToCart);
router.post("/removeFromCart/:productID", verifyJWT, removeFromCart);

//collection route
router.post("/createCollection", verifyJWT, createCollection);
router.post(
  "/addProductToCollection/:productID",
  verifyJWT,
  addProductToCollection
);
router.post(
  "/removeProductToCollection/:productID",
  verifyJWT,
  removeProductToCollection
);
router.delete("/deleteCollection/:collectionID", verifyJWT, deleteCollection);
router.put("/updateCollection/:collectionID", verifyJWT, updateCollection);

module.exports = router;
