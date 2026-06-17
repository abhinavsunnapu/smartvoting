const express = require("express");
const router = express.Router();
const {
  register,
  loginUser,
  verifyOTP,
  resendOTP,
  changePassword,
  verifyFace,
} = require("../Controllers/authController");
const { protect } = require("../Middleware/AuthMiddleWare");
const {
  validateRegister,
  validateLogin,
  validateOTP,
} = require("../Middleware/validationMiddleware");

router.post("/register", validateRegister, register);
router.post("/verify-otp", validateOTP, verifyOTP);
router.post("/resend-otp", validateOTP, resendOTP);
router.post("/login", validateLogin, loginUser);
router.post("/change-password", protect, changePassword);
router.post("/verify-face", protect, verifyFace);

module.exports = router;
