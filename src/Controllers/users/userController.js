const express = require("express");
const AppError = require("../../utils/ErrorHandler");
const AsyncError = require("../../utils/AsyncError");
const User = require("../../Model/userModel");
const Jwt = require("jsonwebtoken");
const { uploadToCloudinary } = require("../../utils/cloudinaryConfig");

const jsontoken = (id) => {
  return Jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//Get user
const getUser = AsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  // .populate("Cart")
  // .populate("Wishlist")
  // .populate("Order");

  if (!user) {
    res.json({
      sucess: false,
      message: "User not found",
    });
  }

  res.json({ sucess: true, message: "User Profile", user });
});

//Change user details
const updateUserData = AsyncError(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user,
    { $set: req.body },
    { new: true }
  );
  if (!updatedUser) {
    res.json({
      sucess: false,
      message: "Unable to update user now.",
    });
  }
  res.json({
    sucess: true,
    message: "User updated",
    updatedUser,
  });
});

//Change user password when the user is logged in
const changePassword = AsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    res.json({
      sucess: false,
      message: "Incorrect Password",
    });
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  const token = jsontoken(user._id);
  res.json({ sucess: true, message: "Password updated", token });
});

const updateUserImage = AsyncError(async (req, res, next) => {
  // const user = req.user.id
  const user = await User.findById(req.user.id);
  if (!user) {
    res.json({
      sucess: false,
      message: "User not found",
    });
  }

  if (!req.file.path) {
    res.json({
      sucess: false,
      message: "unable to upload user image.",
    });
  }

  const imagePath = req.file.path;

  const image = await uploadToCloudinary(imagePath);

  console.log(image);
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id, // use req.user.id directly
    { $set: { userImage: image } },
    { new: true }
  );
  res.json({ sucess: true, message: "Iage uploaded", updatedUser });
});

module.exports = { getUser, updateUserData, changePassword, updateUserImage };
