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

// const User = require("../models/User"); // Import your User model or replace it with the actual path
// const uploadToCloudinary = require("./path-to-your-uploadToCloudinary-file");

// // Your user controller for handling user-related functionality
// const UserController = {
//   // Other methods for user management...

//   // Method for handling user profile picture upload
//   uploadProfilePicture: async (req, res, next) => {
//     try {
//       // Assuming you are using Multer middleware for handling file uploads,
//       // and the uploaded file is available in req.file
//       const imagePath = req.file.path;

//       // Upload the image to Cloudinary using the function
//       const cloudinaryResult = await uploadToCloudinary(imagePath);

//       // Update the user's profile picture URL in the database
//       const userId = req.user.id; // Assuming you have user information in req.user
//       const updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { profilePicture: cloudinaryResult.secure_url },
//         { new: true }
//       );

//       // You can now use the updatedUser in your logic or send it as a response
//       console.log("Updated User:", updatedUser);

//       // Send a success response or perform further actions
//       res.status(200).json({
//         success: true,
//         message: "Profile picture uploaded successfully.",
//         user: updatedUser,
//       });
//     } catch (error) {
//       // Handle any errors that might occur during the upload or processing
//       console.error("Error uploading profile picture:", error);

//       // You might want to send an error response
//       res.status(500).json({
//         success: false,
//         message: "Error uploading profile picture. Please try again.",
//         error: error.message,
//       });
//     }
//   },
// };

// // Export the controller for use in your routes
// module.exports = UserController;
