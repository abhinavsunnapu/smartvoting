const mongoose = require("mongoose");
const User = require("./Models/User");
const dotenv = require("dotenv");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();

const API_URL = "http://localhost:4000/api/auth";

// Dummy face descriptor (128 random numbers)
const dummyFace = Array.from({ length: 128 }, () => Math.random());

async function test() {
  console.log("🚀 Starting Face Uniqueness Verification Test...");

  try {
    // 1. Cleanup: Remove test users if they exist
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({ email: { $in: ["test1@example.com", "test2@example.com"] } });
    console.log("🧹 Cleaned up test users.");

    // 2. Register Test User 1
    console.log("\n📝 Registering User 1 (test1@example.com)...");
    const res1 = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "User One",
        email: "test1@example.com",
        password: "Password123!",
        faceDescriptor: dummyFace,
        role: "admin"
      })
    });
    const data1 = await res1.json();
    console.log(`   Response: ${res1.status} - ${data1.message}`);

    // 3. Manually verify User 1 in DB
    const user1 = await User.findOne({ email: "test1@example.com" });
    if (user1) {
      user1.isEmailVerified = true;
      await user1.save();
      console.log("✅ User 1 manually verified in database.");
    } else {
      throw new Error("User 1 not found after registration");
    }

    // 4. Attempt to register User 2 with DIFFERENT email but SAME face
    console.log("\n📝 Registering User 2 (test2@example.com) with SAME face...");
    const res2 = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "User Two",
        email: "test2@example.com",
        password: "Password123!",
        faceDescriptor: dummyFace, // EXACT SAME FACE
        role: "voter"
      })
    });
    const data2 = await res2.json();
    console.log(`   Response: ${res2.status} - ${data2.message}`);
    
    if (res2.status === 400 && data2.message.includes("face is already registered")) {
        console.log("🎉 SUCCESS: Uniqueness check blocked the registration correctly.");
    } else {
        console.log("❌ FAILURE: Uniqueness check did not block the registration as expected.");
    }

    // 5. Attempt to register SAME User 1 with SAME face but DIFFERENT role
    console.log("\n📝 Registering User 1 (test1@example.com) with SAME face but NEW role (voter)...");
    const res3 = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "User One",
        email: "test1@example.com",
        password: "Password123!",
        faceDescriptor: dummyFace,
        role: "voter"
      })
    });
    const data3 = await res3.json();
    console.log(`   Response: ${res3.status} - ${data3.message}`);

    if (res3.status === 200 && data3.alreadyVerified) {
        console.log("🎉 SUCCESS: Role appending worked correctly for the same user.");
    } else {
        console.log("❌ FAILURE: Role appending did not work as expected.");
    }

  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

test();
