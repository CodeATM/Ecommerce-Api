const express = require("express");
const AsyncError = require("../../utils/AsyncError");
const User = require("../../Model/userModel");
const Jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHandler");
const { BadRequestError, NotFoundError } = require("../ErrorController");
const wishlist = require("../../Model/wishlist");

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
    await wishlist.create({ user: user.id });
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
const loginUser = async (req, res, next) => {
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
};

//forget Password
const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError("Input a valid Email.");
    }
    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFoundError("User not found.");
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //Send it to user's email
    try {
      //change the url as soon ass you can it just a dummy
      // const resetURL = `www.awelewa.io/test/api/v1/users/resetPassword/${resetToken}`;
      // await new Email(user, resetURL).sendPasswordReset();

      await successResponse(res, 200, "Token sent to yor Email", resetToken);
    } catch (err) {
      user.passwordResetToken = undefined;
      user.paswordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return errorResponse(res, 400, "Error sending Token to email");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//verify the sent token
const resetPassword = AsyncError(async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      paswordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new NotFoundError("user not found");
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.paswordResetExpires = undefined;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    await successResponse(res, 201, "user reset password successful");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//Change user password when the user is logged in
const changePassword = AsyncError(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");
    if (
      !(await user.correctPassword(req.body.currentPassword, user.password))
    ) {
      throw new BadRequestError("Password incorrect.");
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    await successResponse(res, 202, "Password Changed Successfully");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = {
  registerUser,
  loginUser,
  forgetPassword,
  changePassword,
  resetPassword,
};
