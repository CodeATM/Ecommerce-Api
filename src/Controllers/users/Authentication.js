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

//Register user
const registerUser = AsyncError(async (req, res, next) => {
  const user = await User.create(req.body);

  const token = jsontoken(user._id);
  res.json({
    sucess: true,
    messaage: "Account created successfuly",
    token,
    user,
  });
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

  const token = jsontoken(user._id);
  res.json({ sucess: true, messaage: "Account logged in successfuly", token });
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

  const token = jsontoken(user._id);

  res.json({
    success: "success",
    message: "Password changed successfully",
    token,
  });
});

module.exports = { registerUser, loginUser, forgetPassword, resetPassword };
