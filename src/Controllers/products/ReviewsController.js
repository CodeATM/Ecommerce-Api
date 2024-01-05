const Review = require("../../Model/reviewModel");
const AppError = require("../../utils/ErrorHandler");
const AsyncError = require("../../utils/AsyncError");
const Product = require("../../Model/ProductModel");
const User = require("../../Model/userModel");

const createReview = AsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { review, rating } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    return next(new AppError("Product not found"));
  }

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
    return next(new AppError("Product not found"));
  }

  const productReviews = await Review.find({ product: product.id })
    .populate({
      path: "product",
      select: "id name description",
    })
    .populate({
      path: "user",
      select: "id firstname email",
    });
  res.json({
    sucess: true,
    messaage: "Here are the product reviews",
    productReviews,
  });
});

const editProductReview = AsyncError(async (req, res, next) => {
  const { id } = req.params;
  const review = await Review.findById({_id: id})
  const user = await User.findById(req.user);
  if (review.user === user.id) {
    return next(new AppError("You are not the author of this review"));
  }

  const updateReview = await Review.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true }
  );
  res.json({
    sucess: true,
    messaage: "Here are the product reviews",
    updateReview,
  });
});

const deleteProductReview = AsyncError(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(req.user);
    if (user.isAdmin = "false") {
      return next(new AppError("You are not authorized to do this"));
    }
  
    const deleteReview = await Review.findByIdAndDelete(id);
    res.json({
      sucess: true,
      messaage: "Review Deleted",
    });
  });

module.exports = { createReview, getProductReviews, editProductReview, deleteProductReview};
