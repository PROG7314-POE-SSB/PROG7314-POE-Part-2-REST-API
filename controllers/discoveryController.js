const { db } = require("../services/firebase");
const spoonacularService = require("../services/spoonacularService");
const { Recipe } = require("../models/recipeModels");

/**
 * Get random recipes based on user preferences
 * GET /api/discovery/random
 */
exports.getRandomRecipes = async (req, res) => {
  try {
    const userId = req.user.uid;
    console.log(`Fetching recipes for user: ${userId}`);

    // Get user's onboarding preferences from Firestore
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    const onboarding = userData.onboarding;

    if (!onboarding) {
      return res.status(400).json({ error: "User onboarding data not found" });
    }

    // Extract user preferences
    const userPreferences = {
      allergies: onboarding.allergies || {
        dairy: false,
        eggs: false,
        nuts: false,
        shellfish: false,
        soy: false,
        wheat: false,
      },
      dietaryPreferences: onboarding.dietaryPreferences || {
        glutenFree: false,
        vegan: false,
        vegetarian: false,
      },
      language: onboarding.preferences?.language || "en",
    };

    console.log("User preferences:", {
      dietary: userPreferences.dietaryPreferences,
      allergies: Object.entries(userPreferences.allergies)
        .filter(([key, value]) => value)
        .map(([key]) => key),
    });

    // Get random recipes from Spoonacular API
    const spoonacularResponse = await spoonacularService.getRandomRecipes(
      userPreferences
    );

    if (!spoonacularResponse || !spoonacularResponse.recipes) {
      return res.status(404).json({ error: "No recipes found" });
    }

    // Transform Spoonacular recipes to our recipe model
    const recipes = spoonacularResponse.recipes.map((spoonacularRecipe) => {
      return new Recipe(spoonacularRecipe);
    });

    console.log(`Successfully fetched ${recipes.length} recipes`);

    res.status(200).json({
      message: "Random recipes retrieved successfully",
      count: recipes.length,
      recipes: recipes,
    });
  } catch (error) {
    console.error("Error fetching random recipes:", error.message);
    res.status(500).json({
      error: "Failed to fetch random recipes",
      details: error.message,
    });
  }
};

/**
 * Search recipes based on query and user preferences
 * POST /api/discovery/search
 */
exports.searchRecipes = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { query } = req.body;

    console.log(`Searching recipes for user: ${userId}, query: "${query}"`);

    // Validate query
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const searchQuery = query.trim();

    // Get user's onboarding preferences from Firestore
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    const onboarding = userData.onboarding;

    if (!onboarding) {
      return res.status(400).json({ error: "User onboarding data not found" });
    }

    // Extract user preferences (same as getRandomRecipes)
    const userPreferences = {
      allergies: onboarding.allergies || {
        dairy: false,
        eggs: false,
        nuts: false,
        shellfish: false,
        soy: false,
        wheat: false,
      },
      dietaryPreferences: onboarding.dietaryPreferences || {
        glutenFree: false,
        vegan: false,
        vegetarian: false,
      },
      language: onboarding.preferences?.language || "en",
    };

    console.log("User preferences for search:", {
      dietary: userPreferences.dietaryPreferences,
      allergies: Object.entries(userPreferences.allergies)
        .filter(([key, value]) => value)
        .map(([key]) => key),
    });

    // Search recipes from Spoonacular API (returns full recipe data)
    const spoonacularResponse = await spoonacularService.searchRecipes(
      searchQuery,
      userPreferences
    );

    if (!spoonacularResponse || !spoonacularResponse.recipes) {
      return res.status(404).json({
        error: "No search results found",
        query: searchQuery,
        count: 0,
        recipes: [],
      });
    }

    // Transform Spoonacular recipes to our recipe model (SAME AS getRandomRecipes!)
    const recipes = spoonacularResponse.recipes.map((spoonacularRecipe) => {
      return new Recipe(spoonacularRecipe);
    });

    console.log(
      `Successfully found ${recipes.length} search results for query: "${searchQuery}"`
    );

    // Return in EXACTLY the same format as getRandomRecipes
    res.status(200).json({
      message: "Recipe search completed successfully",
      query: searchQuery,
      count: recipes.length,
      recipes: recipes,
    });
  } catch (error) {
    console.error("Error searching recipes:", error.message);
    res.status(500).json({
      error: "Failed to search recipes",
      details: error.message,
    });
  }
};

/**
 * Get user preferences (for debugging purposes)
 * GET /api/discovery/preferences
 */
exports.getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    const onboarding = userData.onboarding;

    res.status(200).json({
      message: "User preferences retrieved successfully",
      preferences: onboarding,
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    res.status(500).json({ error: "Failed to fetch user preferences" });
  }
};
