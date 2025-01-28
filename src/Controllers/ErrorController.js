const Jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/responseHandler");
const { MongoServerError } = require("mongodb");
const mongoose = require("mongoose");

// Base error class
class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
  }
}

// Specific error classes
class BadRequestError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

class InternalServerError extends AppError {
  constructor(message) {
    super(message, 500);
  }
}

// Utility function to handle Mongoose validation errors
const formatMongooseValidationError = (error) => {
  const formattedErrors = Object.values(error.errors).map((err) => ({
    field: err.path,
    message: err.message,
  }));

  return {
    message: "Validation failed.",
    statusCode: 400,
    data: formattedErrors,
    error: true,
  };
};

// Error middleware
class errorMiddleware {
  static handle(error, req, res, next) {
    const JsonWebTokenError = Jwt.JsonWebTokenError;

    if (error instanceof JsonWebTokenError) {
      return errorResponse(res, 403, "Invalid token.");
    }

    // Handle MongoDB-specific errors
    if (error instanceof mongoose.Error.ValidationError) {
      // Extract validation errors
      const errors = Object.values(error.errors).map((err) => err.message);
      return errorResponse(res, 400, `${errors}`);
    }

    if (error instanceof MongoServerError) {
      switch (error.code) {
        case 11000: {
          const field = Object.keys(error.keyPattern)[0];
          return errorResponse(res, 400, `${field} already exists.`);
        }
        case 121:
          return errorResponse(res, 400, "Document validation failed.");
        default:
          return errorResponse(res, 500, "Database error occurred.");
      }
    }

    // Handle application-specific errors
    if (error instanceof AppError) {
      return errorResponse(res, error.status, error.message);
    }

    // Handle unexpected errors
    console.error("Unexpected error:", error);
    return errorResponse(res, 500, "An unexpected error occurred.");
  }
}

module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
  errorMiddleware,
};
