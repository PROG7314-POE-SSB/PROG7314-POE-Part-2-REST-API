const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { db, checkFirebaseHealth } = require("./services/firebase");

const app = express();

// Routes
const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/", healthRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port: http://localhost:${PORT}`);
  console.log(`📋 Project: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log("🔍 Checking Firebase connection...");

  // Check Firebase health
  const healthCheck = await checkFirebaseHealth();

  if (healthCheck.success) {
    console.log("✅", healthCheck.message);
    console.log("📊 Firestore:", healthCheck.services.firestore);
    console.log("🔐 Auth:", healthCheck.services.auth);
    console.log("🧹 Test document cleaned up successfully");
  } else {
    console.error("❌", healthCheck.message);
    if (healthCheck.error) {
      console.error("Error details:", healthCheck.error);
    }
    console.error("📊 Firestore:", healthCheck.services.firestore);
    console.error("🔐 Auth:", healthCheck.services.auth);
    console.warn(
      "⚠️  Server started but some Firebase services may not be available"
    );
  }
});
