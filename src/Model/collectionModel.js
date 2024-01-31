const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    collectionName: {
      type: String,
      required: [true, "Collection must have a name"],
      unique: [true, "collection name must be unique"],
    },
    product: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    collectionDescription: {
      type: String,
      required: [true, "Collection needs a description"],
      maxLength: [250, "Description must not be more than 250 character"],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    collectionBanner: String
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

collectionSchema.pre(/^find/, function (next) {
  this.populate({
    path: "product",
    select: "name description images",  });
  next();
});

module.exports = mongoose.model("Collection", collectionSchema);
