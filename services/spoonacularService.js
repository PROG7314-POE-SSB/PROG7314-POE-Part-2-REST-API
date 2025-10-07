/*
 * Code Attribution
 *
 * Purpose:
 *   - Integrate the Spoonacular API for recipe search, filtering, and retrieval based on dietary preferences and allergies.
 *   - Implement asynchronous recipe fetching using Node.js Promises and structured fallback logic.
 *   - Manage environment variables securely with dotenv for API key configuration.
 *
 * Authors/Technologies Used:
 *   - Spoonacular API SDK: Spoonacular API Team
 *   - dotenv for configuration management: Motdotla (Open Source)
 *   - Node.js platform and Promise-based asynchronous patterns
 *
 * References:
 *   - Spoonacular API Documentation: https://spoonacular.com/food-api/docs
 *   - Spoonacular Node.js SDK: https://www.npmjs.com/package/spoonacular
 *   - dotenv Library: https://github.com/motdotla/dotenv
 *   - Node.js Promises Guide: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */

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
   * Get detailed recipe information by ID
   */
  async getRecipeInformation(recipeId) {
    try {
      console.log(`Fetching recipe information for ID: ${recipeId}`);

      const opts = {
        includeNutrition: false, // We don't need nutrition data for now
        addWinePairing: false, // We don't need wine pairing
        addTasteData: false, // We don't need taste data
      };

      return new Promise((resolve, reject) => {
        this.recipesApi.getRecipeInformation(
          recipeId,
          opts,
          (error, data, response) => {
            if (error) {
              console.error(
                "Spoonacular getRecipeInformation API call failed:",
                error
              );
              reject(error);
            } else {
              console.log(
                `Recipe information API call successful for ID: ${recipeId}`
              );
              console.log("Recipe title:", data?.title);
              console.log(
                "Has extendedIngredients?",
                !!data?.extendedIngredients
              );
              console.log(
                "Has analyzedInstructions?",
                !!data?.analyzedInstructions
              );
              console.log("Has summary?", !!data?.summary);
              resolve(data);
            }
          }
        );
      });
    } catch (error) {
      throw new Error(
        `Spoonacular recipe information API error: ${error.message}`
      );
    }
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
   * Search recipes based on query and user preferences with smart fallback logic
   * Returns full recipe data in the same format as getRandomRecipes
   */
  async searchRecipes(query, userPreferences) {
    try {
      console.log(`Searching recipes for query: "${query}"`);

      // Step 1: Try with query + dietary preferences + allergies
      let searchResults = await this.trySearchWithDietaryAndAllergies(
        query,
        userPreferences
      );

      // Step 2: If no results found, try with query + only dietary preferences
      if (!searchResults || searchResults.length === 0) {
        console.log(
          "No search results found with allergies filter, trying dietary preferences only..."
        );
        searchResults = await this.trySearchWithDietaryOnly(
          query,
          userPreferences
        );
      }

      // Step 3: If still no results, search without any filters
      if (!searchResults || searchResults.length === 0) {
        console.log(
          "No search results found with dietary preferences, searching without filters..."
        );
        searchResults = await this.trySearchWithoutFilters(query);
      }

      // Return in the same format as getRandomRecipes
      return { recipes: searchResults || [] };
    } catch (error) {
      throw new Error(`Spoonacular search API error: ${error.message}`);
    }
  }

  /**
   * Try search with dietary preferences and allergies
   */
  async trySearchWithDietaryAndAllergies(query, userPreferences) {
    const opts = this.buildSearchOptions();

    // Add dietary preferences
    this.addDietaryPreferencesToSearch(opts, userPreferences);

    // Add allergy exclusions
    this.addAllergyExclusionsToSearch(opts, userPreferences);

    console.log("Searching with dietary preferences and allergies:", opts);
    return await this.makeSearchApiCall(query, opts);
  }

  /**
   * Try search with only dietary preferences
   */
  async trySearchWithDietaryOnly(query, userPreferences) {
    const opts = this.buildSearchOptions();

    // Add only dietary preferences, no allergy exclusions
    this.addDietaryPreferencesToSearch(opts, userPreferences);

    console.log("Searching with dietary preferences only:", opts);
    return await this.makeSearchApiCall(query, opts);
  }

  /**
   * Try search without any filters
   */
  async trySearchWithoutFilters(query) {
    const opts = this.buildSearchOptions();
    console.log("Searching without filters:", opts);
    return await this.makeSearchApiCall(query, opts);
  }

  /**
   * Build search API options - configured to return full recipe data
   */
  buildSearchOptions() {
    return {
      addRecipeInformation: true, // This gives us full recipe data!
      addRecipeNutrition: false, // We don't need nutrition for now
      instructionsRequired: true, // Ensure recipes have instructions
      fillIngredients: false, // We don't need ingredient analysis
      number: 10, // Return 10 results
      offset: 0,
      sort: "popularity",
      sortDirection: "desc",
    };
  }

  /**
   * Add dietary preferences to search options
   */
  addDietaryPreferencesToSearch(opts, userPreferences) {
    // Handle diet parameter
    if (userPreferences.dietaryPreferences.vegan) {
      opts.diet = "vegan";
    } else if (userPreferences.dietaryPreferences.vegetarian) {
      opts.diet = "vegetarian";
    }

    // Handle gluten-free as intolerance
    if (userPreferences.dietaryPreferences.glutenFree) {
      opts.intolerances = "gluten";
    }
  }

  /**
   * Add allergy exclusions to search options
   */
  addAllergyExclusionsToSearch(opts, userPreferences) {
    const intolerances = [];

    // Add existing gluten-free if already set
    if (opts.intolerances) {
      intolerances.push(opts.intolerances);
    }

    // Add allergies as intolerances
    if (userPreferences.allergies.dairy) {
      intolerances.push("dairy");
    }
    if (userPreferences.allergies.eggs) {
      intolerances.push("egg");
    }
    if (userPreferences.allergies.nuts) {
      intolerances.push("tree nut", "peanut");
    }
    if (userPreferences.allergies.shellfish) {
      intolerances.push("shellfish");
    }
    if (userPreferences.allergies.soy) {
      intolerances.push("soy");
    }
    if (userPreferences.allergies.wheat) {
      intolerances.push("wheat");
    }

    if (intolerances.length > 0) {
      opts.intolerances = intolerances.join(",");
    }
  }

  /**
   * Make the search API call - returns full recipe objects
   */
  async makeSearchApiCall(query, opts) {
    return new Promise((resolve, reject) => {
      this.recipesApi.searchRecipes(query, opts, (error, data, response) => {
        if (error) {
          console.error("Spoonacular search API call failed:", error);
          reject(error);
        } else {
          const results = data?.results || [];
          console.log(
            `Search API call successful: ${results.length} results found`
          );

          // Log the structure of the first result to see what we get
          if (results.length > 0) {
            console.log(
              "Sample search result structure:",
              Object.keys(results[0])
            );
            console.log(
              "Has extendedIngredients?",
              !!results[0].extendedIngredients
            );
            console.log(
              "Has analyzedInstructions?",
              !!results[0].analyzedInstructions
            );
            console.log("Has summary?", !!results[0].summary);
          }

          resolve(results);
        }
      });
    });
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
   * Build base API options for random recipes
   */
  buildBaseOptions() {
    return {
      includeNutrition: false,
      number: 10,
    };
  }

  /**
   * Add dietary preferences to API options for random recipes
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
   * Add allergy exclusions to API options for random recipes
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
   * Make the actual API call for random recipes
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
