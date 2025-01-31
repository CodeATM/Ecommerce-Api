const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
