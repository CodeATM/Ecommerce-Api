// routes.js
const express = require("express");
const router = express.Router();
const { verifyJWT, restrictTo } = require("../Middleware/verification");

const {
  createCollection,
  addProductToCollection,
  removeProductToCollection,
  getCollection,
  deleteCollection,
  updateCollection,
} = require("../Controllers/products/CollectionController");



router.get("/Collection", verifyJWT, getCollection);
router.post(
  "/createCollection",
  verifyJWT,
  restrictTo("admin"),
  createCollection
);
router.post(
  "/addProductToCollection/:productID",
  verifyJWT,
  restrictTo("admin"),
  addProductToCollection
);
router.post(
  "/removeProductToCollection/:productID",
  verifyJWT,
  restrictTo("admin"),
  removeProductToCollection
);
router.delete(
  "/deleteCollection/:collectionID",
  verifyJWT,
  restrictTo("admin"),
  deleteCollection
);
router.put(
  "/updateCollection/:collectionID",
  verifyJWT,
  restrictTo("admin"),
  updateCollection
);

module.exports = router;
