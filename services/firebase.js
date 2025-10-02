// services/firebase.js
const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const db = admin.firestore();
const auth = admin.auth();

// Firebase health check function
async function checkFirebaseHealth() {
  const results = {
    success: false,
    message: "",
    services: {
      firestore: "❌ Failed",
      auth: "❌ Failed",
    },
    error: null,
  };

  try {
    // Test Firestore by creating and then deleting a test document
    const testDocRef = db.collection("health-check").doc("test-connection");
    await testDocRef.set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: "Connection test",
    });

    // Read the document to verify write/read operations
    const testDoc = await testDocRef.get();
    if (testDoc.exists) {
      results.services.firestore = "✅ Connected";

      // Clean up: delete the test document
      await testDocRef.delete();
    }

    // Test Auth by trying to list users (limited to 1)
    const listUsersResult = await auth.listUsers(1);
    results.services.auth = "✅ Connected";

    results.success = true;
    results.message = "All Firebase services are healthy";
  } catch (error) {
    results.error = error.message;

    // Try to determine which service failed
    if (
      error.message.includes("firestore") ||
      error.message.includes("Firestore")
    ) {
      results.services.firestore = "❌ Failed";
      results.message = "Firestore connection failed";
    } else if (
      error.message.includes("auth") ||
      error.message.includes("Auth")
    ) {
      results.services.auth = "❌ Failed";
      results.message = "Auth service failed";
    } else {
      results.message = "Firebase health check failed";
    }
  }

  return results;
}

module.exports = { db, auth, checkFirebaseHealth };
