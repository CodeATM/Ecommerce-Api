const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const AppError = require("./responseHandler");
const AsyncError = require("../utils/AsyncError");

cloudinary.config({
  cloud_name: process.env.CLOUDDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "users" },
      (error, result) => {
        if (error) {
          reject(new AppError("Error uploading image to Cloudinary", 500));
        } else {
          resolve(result.secure_url);
        }
      }
    ).end(buffer);
  });
};

const uploadProduuctImagesCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "Product" },
      (error, result) => {
        if (error) {
          reject(new AppError("Error uploading image to Cloudinary", 500));
        } else {
          resolve(result.secure_url);
        }
      }
    ).end(buffer);
  });
};

module.exports = { uploadToCloudinary, uploadProduuctImagesCloudinary };
