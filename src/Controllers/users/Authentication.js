const express = require("express");
const AsyncError = require("../../utils/AsyncError");
const User = require("../../Model/userModel");
const Jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { successResponse } = require("../../utils/responseHandler");
const { BadRequestError, NotFoundError } = require("../ErrorController");

const jsontoken = (id) => {
  return Jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//send cookies
const createToken = (user, statusCode, req, res) => {
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
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
const registerUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    const token = jsontoken(user._id);
    const data = {
      userId: user._id,
      accessToken: token,
    };
    await successResponse(res, 201, "user created Successfully", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//Login user
const loginUser = AsyncError(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Input Email and password");
    }

    const user = await User.findOne({ email: email }).select("+password");
    if (!user) {
      throw new NotFoundError("User not found.");
    }
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new BadRequestError("User email or password is incorrect");
    }
    const token = jsontoken(user._id);
    const data = {
      userId: user._id,
      accessToken: token,
    };
    await successResponse(res, 201, "user created Successfully", data);
  } catch (error) {
    console.log(error);
    next(error);
  }
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
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.paswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
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
  console.log(req.user);

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

module.exports = {
  registerUser,
  loginUser,
  forgetPassword,
  changePassword,
  resetPassword,
};
