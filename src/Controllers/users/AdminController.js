const express = require("express");
const AppError = require("../../utils/ErrorHandler");
const AsyncError = require("../../utils/AsyncError");
const User = require("../../Model/userModel");

const getAllUser = AsyncError(async (req, res, next) => {
  const user = await User.findById(req.user);
  if (!user.isAdmin == true) {
    new AppError("You are not authorized to get all users", 404);
  }

  const allUsers = await User.find();
  res.json({ sucess: true, messaage: "Here are all the users", allUsers });
});


module.exports = { getAllUser, };