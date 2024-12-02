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
  resizeUserPhoto,
} = require("../Controllers/users/userController");
const passport = require("../Controllers/users/passport");

// Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgetPassword", forgetPassword);
router.post("/resetPassword/:token", resetPassword);
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    // Successful authentication, issue JWT and set cookie
    const { token, user } = req.user;

    // Set JWT as HTTP-only cookie
    res.cookie("jwt", token, {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      secure: req.secure || req.headers["x-forwarded-proto"] === "https", // Ensures the cookie is sent over HTTPS
    });

    user.password = undefined; // Remove password from user object

    // Redirect to frontend with token
    res.redirect(`http://localhost:5000`);
  }
); 

router.get("/me", verifyJWT, getUser);
router.patch(
  "/editProfile",
  verifyJWT,
  uploadUserPhoto,
  resizeUserPhoto,
  updateUserData
);
router.put("/changePassword", verifyJWT, changePassword);
router.put("/block", verifyJWT, restrictTo("admin"), restrictAccount);
router.put("/addProfileImage", verifyJWT, updateUserImage);

module.exports = router;
