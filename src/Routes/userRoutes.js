// routes.js
const express = require("express");
const router = express.Router();
const { verifyJWT, restrictTo } = require("../Middleware/verification");
const {
  registerUser,
  loginUser,
  forgetPassword,
  resetPassword,
  changePassword,
} = require("../Controllers/users/Authentication");
const {
  getUser,
  updateUserData,
  updateUserImage,
  restrictAccount,
  uploadUserPhoto,
  resizeUserPhoto
} = require("../Controllers/users/userController");
// const { updateProfilePhoto } = require('../Controllers/userControllers');


// Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgetPassword", forgetPassword);
router.post("/resetPassword/:token", resetPassword);

router.get("/me", verifyJWT, getUser);
router.patch("/editProfile", verifyJWT, uploadUserPhoto, resizeUserPhoto,  updateUserData);
router.put("/changePassword", verifyJWT, changePassword);
router.put("/block", verifyJWT, restrictTo('admin'), restrictAccount);
router.put("/addProfileImage", verifyJWT, updateUserImage);

module.exports = router;
