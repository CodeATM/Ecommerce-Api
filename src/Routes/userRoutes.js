// routes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { successResponse } = require("../utils/responseHandler")
const { verifyJWT, restrictTo } = require("../Middleware/verification");
const {
  registerUser,
  loginUser,
  forgetPassword,
  resetPassword,
  changePassword,
} = require("../Controllers/users/Authentication");
// const {
//   getUser,
//   updateUserData,
//   updateUserImage,
//   restrictAccount,
//   uploadUserPhoto,
//   resizeUserPhoto,
// } = require("../Controllers/users/userController");
const passport = require("../Controllers/users/passport");

// Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgetPassword", forgetPassword);
router.post("/resetPassword/:token", resetPassword);
router.put("/changePassword", verifyJWT, changePassword);
// Google OAuth login route
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    try {
      // Generate JWT
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
      });

      const data = {
        userId: req.user._id,
        accessToken: token,
      };

      // Send success response
      await successResponse(res, 201, "User authenticated successfully", data);

      // Alternatively, redirect to the frontend with the token
      // res.redirect(`http://localhost:3000?token=${token}`);
    } catch (error) {
      console.error("Error during authentication callback:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);
// router.get("/me", verifyJWT, getUser);
// router.patch(
//   "/editProfile",
//   verifyJWT,
//   uploadUserPhoto,
//   resizeUserPhoto,
//   updateUserData
// );
const paswordSecFunc = () => {};
// router.put("/block", verifyJWT, restrictTo("admin"), restrictAccount);
// router.put("/addProfileImage", verifyJWT, updateUserImage);

module.exports = router;
