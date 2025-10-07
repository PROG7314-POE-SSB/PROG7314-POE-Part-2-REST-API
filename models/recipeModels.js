/**
 * Recipe ingredient model
 */
class RecipeIngredient {
  constructor(data) {
    this.name = data.name || data.originalName || "";
    this.quantity = data.amount || 0;
    this.unit = data.unit || "";
  }
}

/**
 * Recipe instruction model
 */
class RecipeInstruction {
  constructor(stepNumber, instruction) {
    this.stepNumber = stepNumber;
    this.instruction = instruction;
  }
}

/**
 * Main recipe model
 */
class Recipe {
  constructor(spoonacularData) {
    this.recipeId = spoonacularData.id;
    this.title = spoonacularData.title || "";
    this.description = spoonacularData.summary
      ? this.stripHtml(spoonacularData.summary)
      : "";
    this.imageUrl = spoonacularData.image || "";
    this.servings = spoonacularData.servings || 1;
    this.source = "Spoonacular API";
    this.ingredients = this.mapIngredients(
      spoonacularData.extendedIngredients || []
    );
    this.instructions = this.mapInstructions(spoonacularData);
  }

  /**
   * Map Spoonacular ingredients to our ingredient model
   */
  mapIngredients(extendedIngredients) {
    return extendedIngredients.map(
      (ingredient) => new RecipeIngredient(ingredient)
    );
  }

  /**
   * Map Spoonacular instructions to our instruction model
   */
  mapInstructions(spoonacularData) {
    const instructions = [];

    // Check if analyzedInstructions exist and have steps
    if (
      spoonacularData.analyzedInstructions &&
      spoonacularData.analyzedInstructions.length > 0 &&
      spoonacularData.analyzedInstructions[0].steps
    ) {
      spoonacularData.analyzedInstructions[0].steps.forEach((step, index) => {
        instructions.push(
          new RecipeInstruction(step.number || index + 1, step.step)
        );
      });
    }
    // Fallback to the instructions string if analyzedInstructions is empty
    else if (
      spoonacularData.instructions &&
      spoonacularData.instructions.trim() !== ""
    ) {
      // Split instructions by common delimiters and create steps
      const instructionSteps = spoonacularData.instructions
        .split(/\d+\.|\n/)
        .filter((step) => step.trim() !== "")
        .map((step) => step.trim());

      instructionSteps.forEach((step, index) => {
        if (step) {
          instructions.push(new RecipeInstruction(index + 1, step));
        }
      });
    }
    // If no instructions available, add a placeholder
    else {
      instructions.push(
        new RecipeInstruction(1, "Instructions not available for this recipe.")
      );
    }

    return instructions;
  }

  /**
   * Strip HTML tags from text
   */
  stripHtml(html) {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&[^;]+;/g, " ")
      .trim();
  }
}

module.exports = {
  Recipe,
  RecipeIngredient,
  RecipeInstruction,
};
