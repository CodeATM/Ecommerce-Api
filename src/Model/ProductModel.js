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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Product", productSchema);
