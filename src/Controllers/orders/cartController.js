const express = require("express");
const AppError = require("../../utils/ErrorHandler");
const AsyncError = require("../../utils/AsyncError");
const Product = require("../../Model/ProductModel");
const User = require("../../Model/userModel");
const Cart = require("../../Model/cartModel");

//get user cart
const getCart = AsyncError(async (req, res) => {
  const user = await User.findById(req.user);

  if (!user)
    res.json({
      sucess: false,
      message: "Invalid user ID",
    });

  const cart = await Cart.findOne({ user: user.id });
  if (!cart) return;
  res.json({
    sucess: false,
    message: "Cart not found",
  });

  if (cart.products < 1)
    return res.json({
      sucess: false,
      message: "Cart is Empty.",
    });

  res.json({
    sucess: true,
    message: "Here is your cart",
    cart,
  });
});

const getAllCart = AsyncError(async (req, res) => {
  const user = await User.findById(req.user);

  if (!user)
    return res.json({
      sucess: false,
      message: "User not found",
    });

  const cart = await Cart.find();
  if (!cart)
    return res.json({
      sucess: false,
      message: "No Cart found.",
    });

  res.json({
    sucess: true,
    message: "Here is your cart",
    cart,
  });
});

//adding items to cart
const addItemToCart = AsyncError(async (req, res) => {
  const user = await User.exists({ _id: req.user });

  if (!user)
    res.json({
      sucess: false,
      message: "User not found",
    });
  const product = await Product.findById(req.body.productId);

  if (!product)
    res.json({
      sucess: false,
      message: "Product not found",
    });
  const cart = await Cart.findOne({ user: user._id });

  if (cart) {
    const itemIndex = cart.products.findIndex((p) => p.productId == product.id);

    if (itemIndex > -1) {
      let productItem = cart.products[itemIndex];
      productItem.quantity += 1;
      cart.products[itemIndex] = productItem;
    } else {
      cart.products.push({ productId: product.id, quantity: 1 });
      
    }
    await cart.save();
    return res.json({
      sucess: true,
      message: "Cart updated successfully",
      updatedCart: cart,
    });
  } else {
    const newCart = await Cart.create({
      user: user._id,
      products: [{ productId: product.id, quantity: 1, price: product.price }],
    });

    return res.json({
      sucess: true,
      message: "Cart created",
      newCart,
    });
  }
});

// reduce cart quantity
const decreaseQuantity = AsyncError(async (req, res) => {
  // use add product endpoint for increase quantity
  const user = await User.findById(req.user);
  const productId = req.body.productId;

  if (!user)
    return res.json({
      sucess: false,
      message: "User not found",
    });

  const cart = await Cart.findOne({ user: user.id });
  if (!cart)
    return res.json({
      sucess: false,
      message: "Cart not found",
    });

  const itemIndex = cart.products.findIndex((p) => p.productId == productId);

  if (itemIndex > -1) {
    let productItem = cart.products[itemIndex];
    productItem.quantity -= 1;
    cart.products[itemIndex] = productItem;
    await cart.save();
    return res.json({
      sucess: true,
      cart,
    });
  }
  res
    .status(400)
    .send({ status: false, message: "Item does not exist in cart" });
});

const removeItem = AsyncError(async (req, res) => {
  let user = await User.findById(req.user);
  let productId = req.body.productId;

  if (!user)
    return res.status(400).send({ status: false, message: "Invalid user ID" });

  let cart = await Cart.findOne({ user: user.id });
  if (!cart)
    return res
      .status(404)
      .send({ status: false, message: "Cart not found for this user" });

  const itemIndex = cart.products.findIndex((p) => p.productId == productId);
  if (itemIndex > -1) {
    cart.products.splice(itemIndex, 1);
    cart = await cart.save();
    return res.status(200).send({ status: true, updatedCart: cart });
  }

  res
    .status(400)
    .send({ status: false, message: "Item does not exist in cart" });
});

module.exports = {
  addItemToCart,
  decreaseQuantity,
  getCart,
  removeItem,
  getAllCart,
};
