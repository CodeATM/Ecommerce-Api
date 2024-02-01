const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const AppError = require("../utils/ErrorHandler");
const AsyncError = require("../utils/AsyncError");

cloudinary.config({
  cloud_name: process.env.CLOUDDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (imagePath) => {
  try {

    const result = await cloudinary.uploader.upload(imagePath)

    // Return the Cloudinary result
    return result.secure_url;
  } catch (error) {
    // Handle errors and return an error object
    console.log(error)
    return new AppError("Error uploading image to Cloudinary", 500);
  }
};

module.exports = { uploadToCloudinary };
