const express = require("express");
const AppError = require("../../utils/ErrorHandler");
const AsyncError = require("../../utils/AsyncError");
const User = require("../../Model/userModel");
const Jwt = require("jsonwebtoken");
const crypto = require("crypto");

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
  res.json({
    success: "success",
    message: "Password reset token sent successfully",
    resetToken,
  });
});

//verify the sent token
const resetPassword = AsyncError(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Token Invalid or has expired"));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  createToken(user, 200, req, res);
});

module.exports = { registerUser, loginUser, forgetPassword, resetPassword };
