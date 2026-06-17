const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { encryptDescriptor, decryptDescriptor } = require("../utils/faceCrypto");
const { generateOTP, sendOTPEmail } = require("../utils/emailUtils");

const euclideanDistance = (desc1, desc2) => {
  if (desc1.length !== desc2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
};

const register = async (req, res) => {
  let { name, email, password, jobTitle, faceDescriptor, role } = req.body;
  email = email?.toLowerCase().trim();
  const userRole = role === "voter" ? "voter" : "admin";

  console.log("\n🔐 REGISTER REQUEST RECEIVED");
  console.log(`   Email: ${email}`);
  console.log(`   Name: ${name}`);
  console.log(`   Role: ${userRole}`);

  try {
    // Check duplicate
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      const currentRoles = existingUser.roles || [existingUser.role || "admin"];
      if (!currentRoles.includes(userRole)) {
        // Silently append the new role and bypass OTP because they are already verified!
        existingUser.roles = [...currentRoles, userRole];
        await existingUser.save();
        return res.status(200).json({
          message:
            "Role successfully appended to your existing account! Please proceed to login.",
          alreadyVerified: true,
        });
      }
      return res.status(400).json({
        message: "User already exists with this role. Please login.",
      });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters and include letters, numbers, and a special character",
      });
    }

    // Check face uniqueness - Ensure this person doesn't already have an account with a different email
    if (faceDescriptor) {
      console.log(`   Checking face uniqueness...`);
      const verifiedUsersWithFaces = await User.find({ 
        isEmailVerified: true, 
        faceDescriptor: { $exists: true, $ne: null } 
      });
      
      for (const u of verifiedUsersWithFaces) {
        // Skip if it's the same email (the existing logic handles role appending)
        if (u.email === email) continue;

        try {
          const savedDescriptor = decryptDescriptor(u.faceDescriptor);
          const distance = euclideanDistance(faceDescriptor, savedDescriptor);
          
          if (distance <= 0.55) {
            console.log(`   ❌ Face match found with user: ${u.email} (Distance: ${distance.toFixed(4)})`);
            return res.status(400).json({
              message: "This face is already registered with another email address. Please use your original account.",
            });
          }
        } catch (err) {
          console.error(`   ⚠️ Error decrypting descriptor for ${u.email}:`, err.message);
        }
      }
      console.log(`   ✅ Face is unique.`);
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    console.log(`   Generated OTP: ${otp}`);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const encryptedDescriptor = faceDescriptor
      ? encryptDescriptor(faceDescriptor)
      : null;

    // Create or update user with OTP (not verified yet)
    let user = await User.findOne({ email });
    if (user) {
      // Update existing unverified account
      user.name = name;
      user.password = hashedPassword;
      user.jobTitle = jobTitle;
      user.faceDescriptor = encryptedDescriptor || null;
      user.roles = [userRole];
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        jobTitle,
        faceDescriptor: encryptedDescriptor || null,
        roles: [userRole],
        otp,
        otpExpiry,
        isEmailVerified: false,
      });
    }

    // Send OTP email
    console.log(`   Calling sendOTPEmail...`);
    const emailSent = await sendOTPEmail(email, otp);
    console.log(`   Email send result: ${emailSent ? "SUCCESS" : "FAILED"}`);

    if (!emailSent) {
      console.error(`❌ REGISTER FAILED: Email send returned false`);
      return res.status(400).json({
        message: "Email does not exist. Please enter a valid email address.",
      });
    }

    console.log(`✅ User created and OTP email sent to ${email}`);
    res.status(200).json({
      message:
        "OTP sent to your email. Please verify to complete registration.",
      email: email,
      expiresIn: "10 minutes",
    });
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error.message);
    console.error("   Stack:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  let { email, otp } = req.body;
  email = email?.toLowerCase().trim();
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found. Please register first.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Incorrect OTP. Please try again.",
      });
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Email verified successfully. Registration complete!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        jobTitle: user.jobTitle,
        roles: user.roles,
        activeSessionRole: user.roles.includes("voter") ? "voter" : "admin",
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  let { email, password, role } = req.body;
  email = email?.toLowerCase().trim();
  const requestedRole = role === "voter" ? "voter" : "admin";
  try {
    const userAvailable = await User.findOne({ email });
    if (!userAvailable) {
      return res.status(400).json({ message: "User not Exists" });
    }

    const activeRoles = userAvailable.roles || [userAvailable.role || "admin"];

    // Admins can log into both portals, but Voters can only log into Voter portal
    if (!activeRoles.includes(requestedRole)) {
      if (!(activeRoles.includes("admin") && requestedRole === "voter")) {
        return res
          .status(403)
          .json({
            message: `Access denied. Registered roles: [${activeRoles.join(", ")}], please use the correct portal.`,
          });
      }
    }

    if (!userAvailable.isEmailVerified) {
      return res.status(400).json({
        message: "Please verify your email first before logging in",
      });
    }

    const correctPassword = await bcrypt.compare(
      password,
      userAvailable.password,
    );
    if (!correctPassword) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    const token = jwt.sign(
      { id: userAvailable._id, email: userAvailable.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      token,
      user: {
        id: userAvailable._id,
        name: userAvailable.name,
        email: userAvailable.email,
        jobTitle: userAvailable.jobTitle,
        roles: activeRoles,
        activeSessionRole: requestedRole,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const resendOTP = async (req, res) => {
  let { email } = req.body;
  email = email?.toLowerCase().trim();
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found. Please register first.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(400).json({
        message: "Email does not exist. Please enter a valid email address.",
      });
    }

    res.status(200).json({
      message: "OTP resent successfully to your email",
      email: email,
      expiresIn: "10 minutes",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    // Validate inputs
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Email, old password, and new password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // Verify old password
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const verifyFace = async (req, res) => {
  const { faceDescriptor } = req.body;
  const userId = req.user.id; // from token middleware

  if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
    return res
      .status(400)
      .json({ message: "Invalid face descriptor provided" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.faceDescriptor) {
      return res
        .status(400)
        .json({ message: "No face descriptor registered for this user" });
    }

    const savedDescriptor = decryptDescriptor(user.faceDescriptor);
    const distance = euclideanDistance(faceDescriptor, savedDescriptor);

    // threshold: lower is stricter. 0.55 is standard.
    const isMatch = distance <= 0.55;

    if (isMatch) {
      res.status(200).json({ success: true, distance });
    } else {
      res
        .status(401)
        .json({
          success: false,
          message: "Face verification failed. Please try again.",
          distance,
        });
    }
  } catch (error) {
    console.error("verifyFace Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  register,
  loginUser,
  verifyOTP,
  resendOTP,
  changePassword,
  verifyFace,
};
