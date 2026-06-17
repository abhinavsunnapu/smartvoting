const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    jobTitle: { type: String, default: "" },
    faceDescriptor: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    roles: { type: [String], enum: ['admin', 'voter'], default: ['admin'] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
