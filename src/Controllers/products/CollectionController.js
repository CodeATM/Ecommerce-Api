const Collection = require("../../Model/collectionModel");
const AppError = require("../../utils/ErrorHandler");
const AsyncError = require("../../utils/AsyncError");
const Product = require("../../Model/ProductModel");

//get collections
const getCollection = AsyncError(async (req, res, next) => {
  const collection = await Collection.find()
  res.status(200).json({
    sucess: true,
    message: "here are the collection",
    collection,
  });
});

//create collection
const createCollection = AsyncError(async (req, res, next) => {

  const collection = await Collection.create(req.body);
  return res.status(200).json({
    sucess: true,
    message: "Collection created",
    collection,
  });
});

//add product to collection
const addProductToCollection = AsyncError(async (req, res, next) => {
  const { collectionID } = req.body;
  const { productID } = req.params;

  const product = await Product.findById(productID);
  if (!product) {
    return res.status(404).json({
      sucess: false,
      message: "No Product found with this ID",
    });
  }
  const existingCollection = await Collection.findById(collectionID);
  if (!existingCollection) {
    return res.status(404).json({
      sucess: false,
      message: "No Collection found",
    });
  }

  existingCollection.product.push(product.id);

  const updatedCollection = await existingCollection.save();
  return res.status(200).json({
    sucess: true,
    message: "Product added to Collection",
    updatedCollection,
  });
});

//remove product to collection
const removeProductToCollection = AsyncError(async (req, res, next) => {
  const { collectionID } = req.body;
  const { productID } = req.params;

  const product = await Product.findById(productID);
  if (!product) {
    return res.status(404).json({
      sucess: false,
      message: "No product foun with this ID",
    });
  }
  const existingCollection = await Collection.findById(collectionID);
  if (!existingCollection) {
    return res.status(404).json({
      sucess: false,
      message: "Cannot find collection with this ID",
    });
  }

  existingCollection.product.pull(product.id);

  const updatedCollection = await existingCollection.save();
  return res.status(200).json({
    sucess: true,
    message: "Product added to Collection",
    updatedCollection,
  });
});

//delete Collection
const deleteCollection = AsyncError(async (req, res, next) => {
  const { collectionID } = req.params;
  const collection = await Collection.findById(collectionID);
  if (!collection) {
    return res.status(404).json({
      sucess: false,
      message: "Collection not found",
    });
  }

  const deleteCollection = await Collection.findByIdAndDelete(collectionID);
  return res.status(200).json({
    sucess: true,
    message: "Collection deleted",
  });
});

//update collection
const updateCollection = AsyncError(async (req, res, next) => {
  const { collectionID } = req.params;
  const collection = await Collection.findById(collectionID);
  if (!collection) {
    return res.status(404).json({
      sucess: false,
      message: "No collection found",
    });
  }

  const updatedUser = await Collection.findByIdAndUpdate(
    collectionID.id,
    { $set: req.body },
    { new: true }
  );
  return res.status(200).json({
    sucess: true,
    message: "Collection deleted",
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
