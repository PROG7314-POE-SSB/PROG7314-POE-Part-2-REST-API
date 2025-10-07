/*
 * Code Attribution
 *
 * Purpose:
 *   - Middleware to authenticate incoming HTTP requests using Firebase ID tokens.
 *   - Extracts and verifies the token from the Authorization header.
 *   - Attaches the decoded user data to the request object upon successful verification.
 *   - Returns appropriate HTTP status codes for missing or invalid tokens.
 *
 * Authors/Technologies Used:
 *   - Firebase Admin SDK: Firebase Open Source Community
 *   - Node.js (Express Middleware): OpenJS Foundation
 *
 * References:
 *   - Firebase Admin SDK Authentication: https://firebase.google.com/docs/admin/setup
 *   - Express Middleware Documentation: https://expressjs.com/en/guide/using-middleware.html
 */

const admin = require("../services/firebase");

async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = await admin.auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = verifyToken;
