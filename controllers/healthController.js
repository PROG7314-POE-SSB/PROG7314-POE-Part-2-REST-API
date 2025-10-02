/**
 * Status endpoint.
 * Returns running status message.
 * Logs status check request.
 */
exports.status = (req, res) => {
  res.send("PantryChef API running!");
};
