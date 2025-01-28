const AppError = require("../utils/responseHandler");
const Jwt = require("jsonwebtoken");
const User = require("../Model/userModel");

const { UnauthorizedError } = require("../Controllers/ErrorController");

exports.verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for the presence of the Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new UnauthorizedError("Missing or invalid Authorization header")
    );
  }
  const token = authHeader.split(" ")[1];

  try {
    const user = Jwt.verify(token, process.env.JWT_SECRET);
    console.log(user);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError(
        "You are not authorized to perform this action"
      );
    }

    next();
  };
};
