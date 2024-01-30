const Review = require("../../Model/reviewModel");
const AppError = require("../../utils/ErrorHandler");
const AsyncError = require("../../utils/AsyncError");
const Product = require("../../Model/ProductModel");
const User = require("../../Model/userModel");

const createReview = AsyncError(async (req, res, next) => {
  const { productId } = req.params;
  const { review, rating } = req.body;
  console.log(typeof req.user.id)

  const product = await Product.findById(productId);
  if (!product) {
    res.json({
      sucess: false,
      messaage: "Product not found",
    });
  }
  console.log(req.user.id)

  const newReview = await Review.create({
    review,
    rating,
    user: req.user.id,
    product: product.id,
  });
  res.json({
    sucess: true,
    messaage: "Reviews created successfully",
    newReview,
  });
});

const getProductReviews = AsyncError(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    res.status(404).json({
      sucess: false,
      messaage: "Product not found",
    });
  }

  const productReviews = await Review.find({ product: product.id })
  res.status(200).json({
    sucess: true,
    messaage: "Here are the product reviews",
    productReviews,
  });
});

const editProductReview = AsyncError(async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.findById({_id: id})
  if (!review) {
    return res.status(404).json({
      sucess: false,
      message: "Invalid Review ID",
    });
  } else if (req.user !== review.user) {
    return res.status(401).json({
      sucess: false,
      message: "You cannot do this",
    });
  }

  const updateReview = await Review.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, 
    runValidators: true }
  );
  res.json({
    sucess: true,
    messaage: "Here are the product reviews", 
    updateReview,
  });
});

const deleteProductReview = AsyncError(async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.findById({_id: id})
  if (!review) {
    return res.status(404).json({
      sucess: false,
      message: "Invalid Review ID",
    });
  } else if (req.user !== review.user) {
    return res.status(401).json({
      sucess: false,
      message: "You cannot do this",
    });
  }
  
    const deleteReview = await Review.findByIdAndDelete(id);
    res.status(200).json({
      sucess: true,
      messaage: "Review Deleted",
    });
  });

module.exports = {getProductReviews, createReview, editProductReview, getProductReviews, deleteProductReview}
