const Collection = require("../../Model/collectionModel");
const Product = require("../../Model/ProductModel");
const { successResponse } = require("../../utils/responseHandler");
const { NotFoundError } = require("../ErrorController");

//get collections
const getCollection = async (req, res, next) => {
  try {
    const collection = await Collection.find();
    await successResponse(res, 200, "Here is your collection", collection);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//create collection
const createCollection = async (req, res, next) => {
  try {
    const collection = await Collection.create(req.body);
    await successResponse(
      res,
      201,
      "collection created successfully",
      collection
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//add product to collection
const addProductToCollection = async (req, res, next) => {
  try {
    const { collectionID } = req.body;
    const { productID } = req.params;

    const product = await Product.findById(productID);
    if (!product) {
      throw new NotFoundError("No Product found with this ID");
    }
    const existingCollection = await Collection.findById(collectionID);
    if (!existingCollection) {
      throw new NotFoundError("No Collection found with this ID");
    }

    existingCollection.product.push(product.id);

    const updatedCollection = await existingCollection.save();
    await successResponse(res, 200, "Product added Successfully");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//remove product to collection
const removeProductToCollection = async (req, res, next) => {
  try {
    const { collectionID } = req.body;
    const { productID } = req.params;

    const product = await Product.findById(productID);
    if (!product) {
      throw new NotFoundError("No Product found with this ID");
    }
    const existingCollection = await Collection.findById(collectionID);
    if (!existingCollection) {
      throw new NotFoundError("No Collection found with this ID");
    }

    existingCollection.product.pull(product.id);

    const updatedCollection = await existingCollection.save();
    await successResponse(res, 200, "Product removed Successfully");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//delete Collection
const deleteCollection = async (req, res, next) => {
  try {
    const { collectionID } = req.params;
    const collection = await Collection.findById(collectionID);
    if (!collection) {
      throw new NotFoundError("No Collection found with this ID");
    }
    await Collection.findByIdAndDelete(collectionID);
    await successResponse(res, 200, "Collection deleted");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//update collection
const updateCollection = async (req, res, next) => {
  try {
    const { collectionID } = req.params;
    const collection = await Collection.findById(collectionID);
    if (!collection) {
      throw new NotFoundError("No Collection found with this ID");
    }
    await Collection.findByIdAndUpdate(
      collectionID,
      { $set: req.body },
      { new: true }
    );
    await successResponse(res, 200, "Collection updated");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  createCollection,
  addProductToCollection,
  removeProductToCollection,
  getCollection,
  deleteCollection,
  updateCollection,
};
