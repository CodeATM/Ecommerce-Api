// routes.js
const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../Middleware/verification')
const {
  registerUser,
  loginUser,
  forgetPassword,
  resetPassword,
} = require('../Controllers/users/Authentication');
const { getUser, updateUserData, changePassword, updateUserImage} = require('../Controllers/users/userController');
// const { updateProfilePhoto } = require('../Controllers/userControllers');

// Authentication Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgetPassword', forgetPassword);
router.post('/resetPassword/:token', resetPassword);

router.get('/me', verifyJWT, getUser);
router.put('/editProfile', verifyJWT, updateUserData);
router.put('/changePassword', verifyJWT, changePassword);
router.put('/addProfileImage', verifyJWT, updateUserImage);

module.exports = router;
