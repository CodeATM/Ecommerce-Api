const AppError = require("../utils/ErrorHandler");
const AsyncError = require("../utils/AsyncError");
const Jwt = require("jsonwebtoken");
const User = require("../Model/userModel");

exports.verifyJWT = AsyncError(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  const decoded = Jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id);

  if (!token && req.user.isWriter === false) {
    return next(new AppError("You don't have access to this route", 401));
  }
  next();
});
