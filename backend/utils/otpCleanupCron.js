const cron = require("node-cron");
const User = require("../Models/User");

// Run every minute to check for expired OTPs
const startOTPCleanupCron = () => {
  // Runs at every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Find users with OTP that will expire in less than 5 minutes
      const expiringOTPs = await User.find({
        otp: { $ne: null },
        otpExpiry: {
          $lte: new Date(now.getTime() + 5 * 60 * 1000), // Within next 5 minutes
          $gt: now, // But not already expired
        },
        isEmailVerified: false,
      });

      // Find users with OTP that has already expired
      const expiredOTPs = await User.find({
        otp: { $ne: null },
        otpExpiry: { $lt: now },
        isEmailVerified: false,
      });

      // Remove expired OTPs
      if (expiredOTPs.length > 0) {
        await User.updateMany(
          {
            otp: { $ne: null },
            otpExpiry: { $lt: now },
            isEmailVerified: false,
          },
          {
            $set: { otp: null, otpExpiry: null },
          },
        );
        console.log(`🗑️  Cleaned up ${expiredOTPs.length} expired OTPs`);
      }

      // Log users with expiring OTPs (for monitoring)
      if (expiringOTPs.length > 0) {
        console.log(
          `⏰ ${expiringOTPs.length} OTPs expiring soon (within 5 minutes)`,
        );
      }
    } catch (error) {
      console.error("❌ OTP Cleanup Cron Error:", error);
    }
  });

  console.log("✅ OTP Cleanup Cron Job Started");
};

module.exports = { startOTPCleanupCron };
