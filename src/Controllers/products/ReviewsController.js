const Review = require("../../Model/reviewModel");
const Product = require("../../Model/ProductModel");
const User = require("../../Model/userModel");
const { NotFoundError, UnauthorizedError } = require("../ErrorController");
const { successResponse } = require("../../utils/responseHandler");

const createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { review, rating } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product with this Id not found.");
    }

    const newReview = await Review.create({
      review,
      rating,
      user: req.user.id,
      product: product.id,
    });
    await successResponse(res, 201, "Reviews created successfully", newReview);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError("Product with this Id not found.");
    }

    const productReviews = await Review.find({ product: product.id });
    await successResponse(
      res,
      200,
      "Reviews created successfully",
      productReviews
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const editProductReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      throw new NotFoundError("Review with this Id not found.");
    } else if (req.user !== review.user) {
      throw new UnauthorizedError("You cannot edit this review.");
    }

    const updateReview = await Review.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    await successResponse(
      res,
      200,
      "Reviews updated successfully",
      updateReview
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteProductReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      throw new NotFoundError("Review with this Id not found.");
    } else if (req.user !== review.user) {
      throw new UnauthorizedError("You cannot edit this review.");
    }

    await Review.findByIdAndDelete(id);
    await successResponse(res, 200, "Reviews deleted successfully");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createReview,
  editProductReview,
  getProductReviews,
  deleteProductReview,
};
