const wishlist = require("../../Model/wishlist");
const { successResponse } = require("../../utils/responseHandler");
const { NotFoundError } = require("../ErrorController");

const addToWishlist = async (req, res, next) => {
  try {
    const user = req.user;
    const { productId } = req.body;
    const existingWishlist = await wishlist.findOne({ user });
    if (existingWishlist) {
      await existingWishlist.products.push(productId);
      await existingWishlist.save();
    } else {
      const newWishlist = await wishlist.create({ user: user });
      newWishlist.products.push(productId);
      newWishlist.save();
    }

    await successResponse(res, 201, "item added to wishlist");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const user = req.user;
    const { productId } = req.body;
    const existingWishlist = await wishlist.findOne({ user });
    if (existingWishlist.products.includes(productId)) {
      await existingWishlist.products.pop(productId);
      await existingWishlist.save();
    } else {
      throw new NotFoundError("item not found in wislist");
    }

    await successResponse(res, 201, "item removed from wishlist");
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getUserWishlist = async (req, res, next) => {
  try {
    const user = req.user;
    const data = await wishlist.findOne({ user });

    if (!data) {
      throw new NotFoundError("not found");
    }

    await successResponse(res, 200, "user wishlist fetched", data);
  } catch (error) {}
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist
};
