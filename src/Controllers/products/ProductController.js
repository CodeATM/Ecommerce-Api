const Product = require("../../Model/ProductModel");
const AsyncError = require("../../utils/AsyncError");
const AppError = require("../../utils/ErrorHandler");
const Filtering = require("../../utils/Filtering");






const createProduct = AsyncError(async (req, res, next) => {
  const product = await Product.create(req.body);
  return res.status(201).json({
    sucess: true,
    message: "Product created successfuly",
    product,
  });
});

const getAllProduct = AsyncError(async (req, res, next) => {
  const features = new Filtering(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const product = await features.query;

  res.json({ sucess: true, message: "Here are your products", product });
});

const getOneProduct = AsyncError(async (req, res, next) => {
  if (!req.params.productId) {
    res.json({
      sucess: false,
      message: "Product not found",
    });
  }
  const product = await Product.findOne({ _id: req.params.productId });
  if (!product) {
    res.json({
      sucess: false,
      message: "Product not found",
    });
  }
  res.json({ sucess: true, message: "Here is your product", product });
});

const updateProduct = AsyncError(async (req, res, next) => {
  if ((req.user.isAdmin = false)) {
    res.json({
      sucess: false,
      message: "You are not authorized to do this.",
    });
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );
  res.json({ sucess: true, message: "Product Updated", updatedProduct });
});

const deleteProduct = AsyncError(async (req, res, next) => {
  if (!req.user && !req.user.isAdmin == truee) {
    res.json({
      sucess: false,
      message: "You are not authorized to do this",
    });
  }

  const deleteProduct = await Product.findByIdAndDelete(req.params.id);

  res.json({ sucess: true, message: "Product deleted" });
});

// const getPriceRange = AsyncError(async (req, res, next) => {
//   const { maxPrice, minPrice } = req.param;
//   console.log(req.params)
//   const Price = await Product.aggregate([
//     {
//       $match: {
//         price: {
//           $gte: minPrice,
//           $lte: maxPrice,
//         },
//       },
//     },
//   ]);
//   res.json({ sucess: true, message: "Price Range", Price });
// });

module.exports = {
  createProduct,
  getAllProduct,
  updateProduct,
  getOneProduct,
  deleteProduct,
};
