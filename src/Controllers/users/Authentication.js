const express = require("express");
const AppError = require("../../utils/ErrorHandler");
const AsyncError = require("../../utils/AsyncError");
const User = require("../../Model/userModel");
const Jwt = require("jsonwebtoken");
const crypto = require("crypto");
// import Email from './../utils/email.js';

const jsontoken = (id) => {
  return Jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//send cookies
const createToken = (user, statusCode, req, res) => {
  const token = jsontoken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // cookie cannot be accessed or modified in any way by the browser
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

//Register user
const registerUser = AsyncError(async (req, res, next) => {
  const user = await User.create(req.body);

  createToken(user, 201, req, res);
  //change the url as soon ass you can it just a dummy
  // const url = 'www.awelewa.com/shop'
  // await new Email(user, url).sendWelcome();
});

//Login user
const loginUser = AsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("please input your credentials"));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 404));
  }

  createToken(user, 200, req, res);
});

//forget Password
const forgetPassword = AsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError("There is no account registered with this email", 404)
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //Send it to user's email
  try {
      //change the url as soon ass you can it just a dummy
    // const resetURL = `www.awelewa.io/test/api/v1/users/resetPassword/${resetToken}`;
    // await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.paswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!'), 500);
  }
});

//verify the sent token
const resetPassword = AsyncError(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    paswordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token Invalid or has expired"));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.paswordResetExpires = undefined;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  createToken(user, 200, req, res);
});

//Change user password when the user is logged in
const changePassword = AsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  console.log(req.user)

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    res.json({
      sucess: false,
      message: "Incorrect Password",
    });
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  createToken(user, 201, req, res);
});

module.exports = { registerUser, loginUser, forgetPassword, changePassword, resetPassword };
