const mongoose = require("mongoose");
const Product = require("../Model/ProductModel");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    review: {
      type: String,
      required: [true, "Rating is required"],
    },
    rating: {
      type: Number,
      maxLength: [5, "Rating cannot be more than 5"],
      required: [true, "Rating is required"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ product: 1, user: 1 });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstname email ",
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  console.log(stats);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post("save", function () {
  // this points to current review
  console.log('here')
  this.constructor.calcAverageRatings(this.product);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, function (next) {
  this.rev =  this.findOne();
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, function () {
  // await this.findOne(); does NOT work here, query has already executed
   this.rev.constructor.calcAverageRatings(this.rev.product);
   console.log(this.r)
});
module.exports = mongoose.model("Review", reviewSchema);
