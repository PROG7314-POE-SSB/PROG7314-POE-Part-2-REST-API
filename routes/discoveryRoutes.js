const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const discoveryController = require("../controllers/discoveryController");

// GET /api/discovery/random - Get random recipes based on user preferences
router.get("/random", verifyToken, discoveryController.getRandomRecipes);

// POST /api/discovery/search - Search recipes based on query and user preferences
router.post("/search", verifyToken, discoveryController.searchRecipes);

// GET /api/discovery/recipe/:id - Get detailed recipe information by ID
router.get("/recipe/:id", verifyToken, discoveryController.getRecipeById);

// GET /api/discovery/preferences - Get user preferences (for debugging)
router.get("/preferences", verifyToken, discoveryController.getUserPreferences);

module.exports = router;
