const express = require("express");
const AppError = require("../../utils/ErrorHandler");
const AsyncError = require("../../utils/AsyncError");
const User = require("../../Model/userModel");

const getAllUser = AsyncError(async (req, res, next) => {
  const user = await User.findById(req.user);
  if (!user.isAdmin == true) {
    res.json({
      sucess: false,
      message: "You are not authorized to do this",
    });
  }

  const allUsers = await User.find();
  res.json({ sucess: true, message: "Here are all the users", allUsers });
});


//--------------------------Notes---------------------------------


//build a satistic controller 
//for orders generation for getting user most ordered most rated most viewed
//best sellers and all sorts
//

//

module.exports = { getAllUser };
