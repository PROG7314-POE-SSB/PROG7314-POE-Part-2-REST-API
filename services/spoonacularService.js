const Spoonacular = require("spoonacular");
require("dotenv").config();

class SpoonacularService {
  constructor() {
    this.client = Spoonacular.ApiClient.instance;
    const apiKeyScheme = this.client.authentications["apiKeyScheme"];
    apiKeyScheme.apiKey = process.env.SPOONACULAR_API_KEY;
    this.recipesApi = new Spoonacular.RecipesApi();
  }

  /**
   * Get random recipes based on user preferences with smart fallback logic
   */
  async getRandomRecipes(userPreferences) {
    try {
      // Step 1: Try with dietary preferences + allergies
      let recipes = await this.tryWithDietaryAndAllergies(userPreferences);

      // Step 2: If no recipes found, try with only dietary preferences
      if (!recipes || recipes.length === 0) {
        console.log(
          "No recipes found with allergies filter, trying dietary preferences only..."
        );
        recipes = await this.tryWithDietaryOnly(userPreferences);
      }

      // Step 3: If still no recipes, get random recipes
      if (!recipes || recipes.length === 0) {
        console.log(
          "No recipes found with dietary preferences, getting random recipes..."
        );
        recipes = await this.tryRandomRecipes();
      }

      return { recipes: recipes || [] };
    } catch (error) {
      throw new Error(`Spoonacular API error: ${error.message}`);
    }
  }

  /**
   * Try to get recipes with dietary preferences and allergies
   */
  async tryWithDietaryAndAllergies(userPreferences) {
    const opts = this.buildBaseOptions();

    // Add dietary preferences
    this.addDietaryPreferences(opts, userPreferences);

    // Add allergy exclusions
    this.addAllergyExclusions(opts, userPreferences);

    console.log("Trying with dietary preferences and allergies:", opts);
    return await this.makeApiCall(opts);
  }

  /**
   * Try to get recipes with only dietary preferences
   */
  async tryWithDietaryOnly(userPreferences) {
    const opts = this.buildBaseOptions();

    // Add only dietary preferences, no allergy exclusions
    this.addDietaryPreferences(opts, userPreferences);

    console.log("Trying with dietary preferences only:", opts);
    return await this.makeApiCall(opts);
  }

  /**
   * Get random recipes without any filters
   */
  async tryRandomRecipes() {
    const opts = this.buildBaseOptions();
    console.log("Getting random recipes without filters:", opts);
    return await this.makeApiCall(opts);
  }

  /**
   * Build base API options
   */
  buildBaseOptions() {
    return {
      includeNutrition: false,
      number: 10,
    };
  }

  /**
   * Add dietary preferences to API options
   */
  addDietaryPreferences(opts, userPreferences) {
    const includeTags = [];

    if (userPreferences.dietaryPreferences.vegan) {
      includeTags.push("vegan");
    } else if (userPreferences.dietaryPreferences.vegetarian) {
      includeTags.push("vegetarian");
    }

    if (userPreferences.dietaryPreferences.glutenFree) {
      includeTags.push("gluten free");
    }

    if (includeTags.length > 0) {
      opts.includeTags = includeTags.join(",");
    }
  }

  /**
   * Add allergy exclusions to API options
   */
  addAllergyExclusions(opts, userPreferences) {
    const excludeTags = [];

    if (userPreferences.allergies.dairy) {
      excludeTags.push("dairy");
    }
    if (userPreferences.allergies.eggs) {
      excludeTags.push("egg");
    }
    if (userPreferences.allergies.nuts) {
      excludeTags.push("tree nuts", "peanuts");
    }
    if (userPreferences.allergies.shellfish) {
      excludeTags.push("shellfish");
    }
    if (userPreferences.allergies.soy) {
      excludeTags.push("soy");
    }
    if (userPreferences.allergies.wheat) {
      excludeTags.push("wheat");
    }

    if (excludeTags.length > 0) {
      opts.excludeTags = excludeTags.join(",");
    }
  }

  /**
   * Make the actual API call
   */
  async makeApiCall(opts) {
    return new Promise((resolve, reject) => {
      this.recipesApi.getRandomRecipes(opts, (error, data, response) => {
        if (error) {
          console.error("Spoonacular API call failed:", error);
          reject(error);
        } else {
          const recipes = data?.recipes || [];
          console.log(`API call successful: ${recipes.length} recipes found`);
          resolve(recipes);
        }
      });
    });
  }
}

module.exports = new SpoonacularService();
