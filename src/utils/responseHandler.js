const errorResponse = (res, statusCode, message, data = null, error = true) => {
  message = message.endsWith(".") ? message : `${message}.`;

  return res.status(statusCode).json({ message, statusCode, data, error });
};

const successResponse = (res, statusCode, message, data, error = false) => {
  if (statusCode < 200 || statusCode > 299) {
    throw new Error("Invalid status code. Use a valid status code");
  }

  message = message.endsWith(".") ? message : `${message}.`;

  return res.status(statusCode).json({ message, data, error });
};

module.exports = {
  successResponse,
  errorResponse,
};
