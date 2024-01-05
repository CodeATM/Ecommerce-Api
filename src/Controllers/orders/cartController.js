const express = require("express");
const User = require("../../Model/userModel");
const AsyncError = require("../../utils/AsyncError");
const AppError = require("../../utils/ErrorHandler");

const addToCart = AsyncError(async (req, res, next) => {
  const { productID } = req.params;
  if (!req.user) {
    return next(new AppError("You have to login"));
  }
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("no user found with this id"));
  }

  const add = user.cart.push(productID);
  res.json({
    sucess: true,
    messaage: "Product added to cart",
    user,
  });
});

const removeFromCart = AsyncError(async (req, res, next) => {
  const { productID } = req.params;
  if (!req.user) {
    return next(new AppError("You have to login"));
  }
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("no user found with this id"));
  }

  const add = user.cart.pull(productID);
  res.json({
    sucess: true,
    messaage: "Product added to cart",
    user,
  });
});

module.exports = { addToCart, removeFromCart };
