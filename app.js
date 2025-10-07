const express = require("express");
const cors = require("cors");
const localtunnel = require("@n8n/localtunnel");
require("dotenv").config();
const { db, checkFirebaseHealth } = require("./services/firebase");

const app = express();

// Routes
const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");
const pantryRoutes = require("./routes/pantryRoutes");
const shoppingRoutes = require("./routes/shoppingRoutes");
const verifyToken = require("./middleware/authMiddleware");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/", healthRoutes);
app.use("/api/pantry", verifyToken, pantryRoutes);
app.use("/api/shopping-list", verifyToken, shoppingRoutes);
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

  // Set up localtunnel only in development
  if (process.env.NODE_ENV !== "production") {
    try {
      console.log("🌐 Setting up localtunnel...");

      // Developer-specific subdomain approach
      const developerName = process.env.DEVELOPER_NAME || "dev";
      const subdomain = `pantry-chef-${developerName}`;

      console.log(`👤 Developer: ${developerName}`);
      console.log(`🏷️  Attempting subdomain: ${subdomain}`);

      let tunnel;

      try {
        // Try with developer-specific subdomain first
        tunnel = await localtunnel({
          port: PORT,
          subdomain: subdomain,
        });

        console.log(`✅ Successfully claimed subdomain: ${subdomain}`);
      } catch (subdomainError) {
        console.log(
          `⚠️  Subdomain '${subdomain}' not available, trying fallback...`
        );

        // Fallback 1: Try with port number
        const fallbackSubdomain = `pantry-chef-${developerName}-${PORT}`;

        try {
          tunnel = await localtunnel({
            port: PORT,
            subdomain: fallbackSubdomain,
          });

          console.log(`✅ Using fallback subdomain: ${fallbackSubdomain}`);
        } catch (fallbackError) {
          console.log(
            `⚠️  Fallback subdomain not available, using random URL...`
          );

          // Fallback 2: Random subdomain
          tunnel = await localtunnel({
            port: PORT,
          });

          console.log(`✅ Using random subdomain`);
        }
      }

      console.log(`🌍 Public URL: ${tunnel.url}`);
      console.log(`📱 Use this URL in your Android app: ${tunnel.url}`);
      console.log("⚠️  Keep this terminal open to maintain the tunnel");

      // Display team coordination info
      console.log("\n" + "=".repeat(60));
      console.log("👥 TEAM DEVELOPMENT INFO");
      console.log("=".repeat(60));
      console.log(`🔧 Your API: ${tunnel.url}`);
      console.log(`👤 Developer: ${developerName}`);
      console.log(`📝 To avoid conflicts, each team member should:`);
      console.log(`   1. Set unique DEVELOPER_NAME in .env file`);
      console.log(`   2. Use their personal tunnel URL in Android app`);
      console.log(`   3. Coordinate who runs the main 'pantry-chef' instance`);
      console.log("=".repeat(60) + "\n");

      // Handle tunnel events
      tunnel.on("close", () => {
        console.log("🔴 Tunnel closed");
      });

      tunnel.on("error", (err) => {
        console.error("❌ Tunnel error:", err);
        console.log("💡 Attempting to reconnect...");
      });

      // Handle reconnection
      tunnel.on("request", (info) => {
        console.log(`📡 Tunnel request: ${info.method} ${info.path}`);
      });

      // Graceful shutdown
      process.on("SIGINT", () => {
        console.log("\n🛑 Shutting down server and tunnel...");
        tunnel.close();
        process.exit(0);
      });

      process.on("SIGTERM", () => {
        console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
        tunnel.close();
        process.exit(0);
      });
    } catch (error) {
      console.error("❌ Failed to create tunnel:", error.message);
      console.log("💡 Server is still running locally on localhost:" + PORT);
      console.log(
        "🔧 Try setting a different DEVELOPER_NAME in your .env file"
      );
    }
  } else {
    console.log("🏭 Production mode: Tunnel disabled");
  }
});
