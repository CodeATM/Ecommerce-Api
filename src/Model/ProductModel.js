const mongoose = require("mongoose");
const validator = require("validator");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product must have a name"],
    },
    description: {
      type: String,
      required: [true, "Product must have a description"],
      maxLength: [
        500,
        "Product description must not be grater than %00 characters",
      ],
    },
    price: {
      type: Number,
      required: [true, "Product must have a price"],
    },
    colors: {
      type: [String],
      required: true,
    },
    sizes: {
      type: [
        {
          type: String,
          enum: ["small", "Medium", "Large", "Xl", "XXL"],
        },
      ],
      required: true,
    },
    categories: {
      type: [
        {
          type: String,
          enum: ["kids", "Adult", "Male", "Female"],
        },
      ],
    },
    images: [Array],
    inStock: {
      type: Boolean,
      default: true
    },
    discount: {
      type: Number,
      default: null,
    },
    discountedPrice: {
      type: Number,
      default: null,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
productSchema.index({ price: 1, ratingsAverage: -1 });

// Virtual populate
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id'
});


module.exports = mongoose.model("Product", productSchema);
