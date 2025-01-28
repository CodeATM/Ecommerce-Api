// routes.js
const express = require("express");
const router = express.Router();
const { verifyJWT, restrictTo } = require("../Middleware/verification");
const {
  createProduct,
  getAllProduct,
  updateProduct,
  getOneProduct,
  deleteProduct,
  uploadProductImages,
  resizeproductImages
} = require("../Controllers/products/ProductController");

// const {
//   createCollection,
//   addProductToCollection,
//   removeProductToCollection,
//   getCollection,
//   deleteCollection,
//   updateCollection,
// } = require("../Controllers/products/CollectionController");



// router.get("/Collection", verifyJWT, getCollection);

// Product Routes
router.post("/createProduct", verifyJWT,  createProduct);
router.get("/", getAllProduct);
router.get("/:productId", getOneProduct);
router.post("/createProduct", verifyJWT, restrictTo("admin"), createProduct);
router.patch("/updateProduct/:id", verifyJWT, restrictTo("admin"), updateProduct);
router.delete(
  "/deleteProduct/:id",
  verifyJWT,
  restrictTo("admin"),
  deleteProduct
);

//collection route
// router.post(
//   "/createCollection",
//   verifyJWT,
//   restrictTo("admin"),
//   createCollection
// );
// router.post(
//   "/addProductToCollection/:productID",
//   verifyJWT,
//   restrictTo("admin"),
//   addProductToCollection
// );
// router.post(
//   "/removeProductToCollection/:productID",
//   verifyJWT,
//   restrictTo("admin"),
//   removeProductToCollection
// );
// router.delete(
//   "/deleteCollection/:collectionID",
//   verifyJWT,
//   restrictTo("admin"),
//   deleteCollection
// );
// router.put(
//   "/updateCollection/:collectionID",
//   verifyJWT,
//   restrictTo("admin"),
//   updateCollection
// );

module.exports = router;
