const Collection = require("../../Model/collectionModel");
const AppError = require("../../utils/ErrorHandler");
const AsyncError = require("../../utils/AsyncError");
const Product = require("../../Model/ProductModel");

//get collections
const getCollection = AsyncError(async (req, res, next) => {
  const collection = await Collection.find().populate({
    path: "product",
    select: "id name description",
  });
  res.json({
    sucess: true,
    messaage: "here are the collection",
    collection,
  });
});

//create collection
const createCollection = AsyncError(async (req, res, next) => {
  if (!req.user.isAdmin == "false") {
    return next(new AppError("You are not authorized to do this"));
  }

  const collection = await Collection.create(req.body);
  res.json({
    sucess: true,
    messaage: "Collection created",
    collection,
  });
});

//add product to collection
const addProductToCollection = AsyncError(async (req, res, next) => {
  const { collectionID } = req.body;
  const { productID } = req.params;
  if (!req.user.isAdmin == "false") {
    return next(new AppError("You cannot Perform this action"));
  }

  const product = await Product.findById(productID);
  if (!product) {
    return next(new AppError("can't find a product with this ID"));
  }
  const existingCollection = await Collection.findById(collectionID);
  if (!existingCollection) {
    return next(new AppError("can't find a collection with this ID"));
  }

  existingCollection.product.push(product.id);

  const updatedCollection = await existingCollection.save();
  res.json({
    sucess: true,
    messaage: "Product adde to Collection",
    updatedCollection,
  });
});

//remove product to collection
const removeProductToCollection = AsyncError(async (req, res, next) => {
  const { collectionID } = req.body;
  const { productID } = req.params;
  if (!req.user.isAdmin == "false") {
    return next(new AppError("You cannot Perform this action"));
  }

  const product = await Product.findById(productID);
  if (!product) {
    return next(new AppError("can't find a product with this ID"));
  }
  const existingCollection = await Collection.findById(collectionID);
  if (!existingCollection) {
    return next(new AppError("can't find a collection with this ID"));
  }

  existingCollection.product.pull(product.id);

  const updatedCollection = await existingCollection.save();
  res.json({
    sucess: true,
    messaage: "Product adde to Collection",
    updatedCollection,
  });
});

//delete Collection
const deleteCollection = AsyncError(async (req, res, next) => {
  const { collectionID } = req.params;
  if (!req.user.isAdmin === false) {
    return next(new AppError("You are not authorized to do this"));
  }
  const collection = await Collection.findById(collectionID);
  if (!collection) {
    return next(new AppError("Colloection not found", 404));
  }

  const deleteCollection = await Collection.findByIdAndDelete(collectionID);
  res.json({
    sucess: true,
    messaage: "Collection deleted",
  });
});

//update collection
const updateCollection = AsyncError(async (req, res, next) => {
  const { collectionID } = req.params;
  if (!req.user.isAdmin === false) {
    return next(new AppError("You are not authorized to do this"));
  }
  const collection = await Collection.findById(collectionID);
  if (!collection) {
    return next(new AppError("Colloection not found"));
  }

  const updatedUser = await Collection.findByIdAndUpdate(
    collectionID.id,
    { $set: req.body },
    { new: true }
  );
  res.json({
    sucess: true,
    messaage: "Collection deleted",
    updatedUser,
  });
});

module.exports = {
  createCollection,
  addProductToCollection,
  removeProductToCollection,
  getCollection,
  deleteCollection,
  updateCollection,
};
