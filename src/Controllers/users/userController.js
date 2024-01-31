const express = require("express");
const AppError = require("../../utils/ErrorHandler");
const AsyncError = require("../../utils/AsyncError");
const User = require("../../Model/userModel");
const { uploadToCloudinary } = require("../../utils/cloudinaryConfig");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

//Get user
const getUser = AsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.json({
      sucess: false,
      message: "User not found",
    });
  }

  res.json({ sucess: true, message: "User Profile", user });
});

//Change user details
// const updateUserData = AsyncError(async (req, res, next) => {
//   const updatedUser = await User.findByIdAndUpdate(
//     req.user,
//     { $set: req.body },
//     { new: true }
//   );
//   if (!updatedUser) {
//     res.json({
//       sucess: false,
//       message: "Unable to update user now.",
//     });
//   }
//   res.json({
//     sucess: true,
//     message: "User updated",
//     updatedUser,
//   });
// });


const updateUserData = AsyncError(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This route is not for password updates. Please use /updateMyPassword.', 400)
    );
  }

  const filteredBody = filterObj(req.body, 'firstname', 'lastname', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  // sending responce to user
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});



// update user profile image
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

const restrictAccount = AsyncError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { restricted: true });

  res.status(204).json({
    status: 'success',
    user
  });
});

module.exports = { getUser, updateUserData, updateUserImage, restrictAccount
};
