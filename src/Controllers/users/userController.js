const express = require("express");
const AppError = require("../../utils/ErrorHandler");
const AsyncError = require("../../utils/AsyncError");
const User = require("../../Model/userModel");
const { uploadToCloudinary } = require("../../utils/cloudinaryConfig");
const multer = require('multer')
const sharp = require('sharp')
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = AsyncError(async (req, res, next) => {
  if (!req.file) return next();

  // Use Sharp to resize the image
  const resizedBuffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer();

  // Upload the resized image to Cloudinary
  const cloudinaryUrl = await uploadToCloudinary(resizedBuffer);

  // Save the Cloudinary URL to the database
   req.file.cloudinaryUrl = cloudinaryUrl;

  next();
});


const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

const updateUserData = AsyncError(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This route is not for password updates. Please use updateMyPassword.', 400)
    );
  }

  const filteredBody = filterObj(req.body, 'firstname', 'lastname', 'email');
  if (req.file) filteredBody.userImage = req.file.cloudinaryUrl;

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

const restrictAccount = AsyncError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { restricted: true });

  res.status(204).json({
    status: 'success',
    user
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

module.exports = { getUser, updateUserData, updateUserImage, restrictAccount, resizeUserPhoto, uploadUserPhoto
};
