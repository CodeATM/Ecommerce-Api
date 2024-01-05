const Product = require("../../Model/ProductModel");
const AsyncError = require("../../utils/AsyncError");
const AppError = require("../../utils/ErrorHandler");
const Filtering = require("../../utils/Filtering");

const createProduct = AsyncError(async (req, res, next) => {
  if ((req.user.isAdmin = false)) {
    return next(new AppError("You cant't do this"));
  }

  const product = await Product.create(req.body);
  res.json({
    sucess: true,
    messaage: "Product created successfuly",
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

  res.json({ sucess: true, messaage: "Here are your product", product });
});

const getOneProduct = AsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new AppError("There is no product id"));
  }
  const product = await Product.findById(req.params.id).populate('reviews');
  if (!product) {
    return next(new AppError("Can't find Product"));
  }
  res.json({ sucess: true, messaage: "Here is your product", product });
});

const updateProduct = AsyncError(async (req, res, next) => {
  if ((req.user.isAdmin = false)) {
    return next(new AppError("You are not authorize to do this!"));
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );
  res.json({ sucess: true, messaage: "Product Updated", updatedProduct });
});

const deleteProduct = AsyncError(async (req, res, next) => {
  if (!req.user && !req.user.isAdmin == truee) {
    return next(new AppError("You are not authorize to do this!"));
  }

  const deleteProduct = await Product.findByIdAndDelete(req.params.id);

  res.json({ sucess: true, messaage: "Product deleted" });
});
module.exports = {
  createProduct,
  getAllProduct,
  updateProduct,
  getOneProduct,
  deleteProduct,
};