const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./Config/db");
const { startOTPCleanupCron } = require("./utils/otpCleanupCron");

// Validate required environment variables
const requiredEnvVars = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "SECRET_KEY",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(
    "\u274c Missing required environment variables:",
    missingVars.join(", "),
  );
  process.exit(1);
}

connectDB();

startOTPCleanupCron();

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", require("./Routes/auth"));
app.use("/api/elections", require("./Routes/electionRoutes"));

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.error("✗ Server failed to start:", err);
    process.exit(1);
  }
  console.log("✅ Server Started on port " + process.env.PORT);
});
