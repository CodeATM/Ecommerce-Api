const Product = require("../../Model/ProductModel");
const AsyncError = require("../../utils/AsyncError");
const AppError = require("../../utils/responseHandler");
const Filtering = require("../../utils/Filtering");
const multer = require("multer");
const sharp = require("sharp");
const {
  uploadProduuctImagesCloudinary,
} = require("../../utils/cloudinaryConfig");
const { successResponse } = require("../../utils/responseHandler");
const { BadRequestError, NotFoundError } = require("../ErrorController");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadProductImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

const resizeproductImages = AsyncError(async (req, res, next) => {
  // 1) Cover image
  req.body.imageCover = await uploadProduuctImagesCloudinary(
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer()
  );

  // 2) Images
  req.body.images = await Promise.all(
    req.files.images.map(async (file, i) => {
      return uploadProduuctImagesCloudinary(
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toBuffer()
      );
    })
  );

  next();
});

const generateUniqueProductId = async () => {
  const generateRandomId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let productId = "";
    for (let i = 0; i < 7; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      productId += chars[randomIndex];
    }
    return productId;
  };

  let productId = generateRandomId();
  const existingProduct = await Product.findOne({ productId });

  if (existingProduct) {
    return generateUniqueProductId();
  }
  return productId;
};

const createProduct = AsyncError(async (req, res, next) => {
  try {
    const productId = await generateUniqueProductId();
    const product = await Product.create({ ...req.body, productId });
    await successResponse(res, 201, "product created", product);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

const getAllProduct = AsyncError(async (req, res, next) => {
  try {
    const features = new Filtering(Product.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const products = await features.query.select(
      "name price imageCover ratingsAverage"
    );

    await successResponse(res, 200, "Product fetched", products);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

const getOneProduct = AsyncError(async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      throw new BadRequestError("Input the product id ");
    }
    const product = await Product.findOne({ productId });
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    await successResponse(res, 200, "Product fetched", product);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

const updateProduct = AsyncError(async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      throw new BadRequestError("Input the product id ");
    }
    const product = await Product.findOne({ productId });
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      { $set: req.body },
      { new: true }
    );
    await successResponse(
      res,
      200,
      "Product updated successfully",
      updatedProduct
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
});

const deleteProduct = AsyncError(async (req, res, next) => {
  if (!req.user && !req.user.isAdmin == true) {
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
  uploadProductImages,
  resizeproductImages,
};
