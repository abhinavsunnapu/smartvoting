const nodemailer = require("nodemailer");

// Create a singleton transporter instance with connection pooling
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  pool: true, // Use pool for multiple emails
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2",
  },
});

// Test connection on startup
console.log("📧 Checking email configuration...");
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email setup failed:", error.message);
  } else {
    console.log("✅ Email transporter ready to send");
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  console.log(`\n📧 SENDING OTP EMAIL to ${email}`);

  const mailOptions = {
    from: `"Voter Management" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification - OTP",
    html: `
      <div style="font-family: 'Inter', 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #00263A; text-align: center; font-size: 24px;">Email Verification</h2>
        <p style="color: #333; font-size: 16px; text-align: center;">Your One-Time Password (OTP) is:</p>
        <div style="background-color: #F3F7FE; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #00263A; letter-spacing: 6px; font-size: 40px; margin: 0; font-weight: bold;">${otp}</h1>
        </div>
        <p style="color: #444; text-align: center; font-size: 15px;">This OTP will expire in <strong>10 minutes</strong>.</p>
        <p style="color: #666; text-align: center; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 25px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">Please do not share this OTP with anyone. This is an automated message.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP EMAIL SENT - MessageID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`EMAIL FAILED:`, error.message);
    return false;
  }
};

// Send Election Notification email
const sendElectionNotification = async (voterEmail, election) => {
  const { title, description, startDate, endDate } = election;

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const mailOptions = {
    from: `"Election Management" <${process.env.EMAIL_USER}>`,
    to: voterEmail,
    subject: `Important: You are allocated to vote in "${title}"`,
    html: `
      <div style="font-family: 'Inter', 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
        <div style="background-color: #00263A; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Election Notification</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <p style="font-size: 16px; color: #262D3A; margin-top: 0;">Hello,</p>
          <p style="font-size: 16px; color: #262D3A;">You have been securely added as an eligible voter for the following election. Please review the details below:</p>
          
          <div style="background-color: #F3F7FE; padding: 20px; border-left: 4px solid #00263A; border-radius: 6px; margin: 25px 0;">
            <h2 style="color: #00263A; margin-top: 0; font-size: 20px; font-weight: 700;">${title}</h2>
            ${description ? `<p style="font-style: italic; color: #555; font-size: 15px; margin-bottom: 20px;">${description}</p>` : ""}
            
            <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="padding: 12px 15px; font-weight: 600; color: #444; width: 80px; border-bottom: 1px solid #f0f0f0;">Starts</td>
                <td style="padding: 12px 15px; color: #059669; font-weight: 500; border-bottom: 1px solid #f0f0f0;">${formatDate(startDate)}</td>
              </tr>
              <tr>
                <td style="padding: 12px 15px; font-weight: 600; color: #444;">Ends</td>
                <td style="padding: 12px 15px; color: #dc2626; font-weight: 500;">${formatDate(endDate)}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 15px; line-height: 1.6; color: #444;">
            Please log in to the secure voter portal during the designated voting period to cast your ballot. Your participation is highly valued.
          </p>
          
          <div style="text-align: center; margin-top: 35px;">
            <p style="font-size: 14px; color: #666; font-weight: 500;">
              Thank you for participating in the democratic process.
            </p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; border-top: 1px solid #eaeaea; padding: 15px; font-size: 12px; color: #888; text-align: center;">
          This is an automated system notification. Please do not reply to this email.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(
      `FAILED to send notification to ${voterEmail}:`,
      error.message,
    );
    return false;
  }
};

module.exports = { generateOTP, sendOTPEmail, sendElectionNotification };
