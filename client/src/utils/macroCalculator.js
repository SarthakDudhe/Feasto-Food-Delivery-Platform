/**
 * Utility functions for calculating and filtering Macro & Dietary profiles of food items
 */

// Mapping defaults by category for realistic macro calculation if items don't explicitly specify macros
const categoryMacroDefaults = {
  Salad: { baseCalories: 280, baseProtein: 18, baseCarbs: 22, baseFat: 12, fiber: 8, tags: ["Gluten-Free", "High Protein", "Low Calorie"] },
  Rolls: { baseCalories: 420, baseProtein: 22, baseCarbs: 48, baseFat: 16, fiber: 4, tags: ["Balanced"] },
  Deserts: { baseCalories: 380, baseProtein: 6, baseCarbs: 58, baseFat: 18, fiber: 2, tags: ["Vegetarian"] },
  Sandwich: { baseCalories: 450, baseProtein: 26, baseCarbs: 42, baseFat: 18, fiber: 5, tags: ["High Protein"] },
  Cake: { baseCalories: 410, baseProtein: 5, baseCarbs: 62, baseFat: 19, fiber: 2, tags: ["Vegetarian"] },
  "Pure Veg": { baseCalories: 320, baseProtein: 14, baseCarbs: 40, baseFat: 10, fiber: 7, tags: ["Vegan", "Vegetarian", "Gluten-Free"] },
  Pasta: { baseCalories: 520, baseProtein: 19, baseCarbs: 68, baseFat: 20, fiber: 5, tags: ["Balanced"] },
  Noodles: { baseCalories: 480, baseProtein: 16, baseCarbs: 64, baseFat: 18, fiber: 4, tags: ["Balanced"] }
};

/**
 * Enriches a raw food item object with calculated macro parameters based on its ID, name, price, and category.
 */
export const getEnrichedMacroItem = (item) => {
  const cat = item.category || "Salad";
  const defaults = categoryMacroDefaults[cat] || categoryMacroDefaults["Salad"];

  // Seed deterministic variations based on item ID / price
  const idNum = parseInt(item._id || "1", 10) || 1;
  const price = item.price || 15;
  const isChicken = (item.name || "").toLowerCase().includes("chicken");
  const isVeg = (item.name || "").toLowerCase().includes("veg") || (item.name || "").toLowerCase().includes("greek") || (item.name || "").toLowerCase().includes("fruit");

  let protein = defaults.baseProtein + (isChicken ? 14 : 0) + (idNum % 5);
  let calories = defaults.baseCalories + (price * 8) + ((idNum * 13) % 40);
  let carbs = Math.max(10, defaults.baseCarbs + ((idNum * 7) % 20) - (isChicken ? 8 : 0));
  let fat = Math.max(5, defaults.baseFat + ((idNum * 3) % 8));
  let fiber = defaults.fiber + (isVeg ? 4 : 0);

  const tags = [...defaults.tags];
  if (protein >= 25 && !tags.includes("High Protein")) tags.push("High Protein");
  if (calories <= 400 && !tags.includes("Low Calorie")) tags.push("Low Calorie");
  if (carbs <= 25 && !tags.includes("Keto Friendly")) tags.push("Keto Friendly");
  if (isVeg && !tags.includes("Vegetarian")) tags.push("Vegetarian");

  const totalMacroGrams = (protein * 4) + (carbs * 4) + (fat * 9) || 1;
  const proteinRatio = Math.round(((protein * 4) / totalMacroGrams) * 100);
  const carbRatio = Math.round(((carbs * 4) / totalMacroGrams) * 100);
  const fatRatio = 100 - proteinRatio - carbRatio;

  return {
    ...item,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    proteinRatio,
    carbRatio,
    fatRatio,
    tags
  };
};

/**
 * Filter food items by target macro preset or custom ranges
 */
export const filterFoodByMacros = (foodList, filters) => {
  if (!foodList || !Array.isArray(foodList)) return [];

  return foodList
    .map(getEnrichedMacroItem)
    .filter((item) => {
      // Filter by preset
      if (filters.preset === "high-protein" && item.protein < 22) return false;
      if (filters.preset === "low-calorie" && item.calories > 400) return false;
      if (filters.preset === "keto" && item.carbs > 30) return false;
      if (filters.preset === "vegan" && !item.tags.includes("Vegan") && !item.name.toLowerCase().includes("veg")) return false;

      // Range filters
      if (filters.maxCalories && item.calories > filters.maxCalories) return false;
      if (filters.minProtein && item.protein < filters.minProtein) return false;
      if (filters.maxCarbs && item.carbs > filters.maxCarbs) return false;
      if (filters.maxFat && item.fat > filters.maxFat) return false;

      // Dietary flags
      if (filters.glutenFree && !item.tags.includes("Gluten-Free")) return false;

      return true;
    });
};

/**
 * Generates an AI Combo Meal (2-3 complementary items) matching a calorie/protein target
 */
export const generateAIMealCombo = (foodList, targetCalories = 600, targetProtein = 35) => {
  const enriched = (foodList || []).map(getEnrichedMacroItem);
  if (enriched.length === 0) return null;

  // Pick a main dish (Roll/Salad/Pasta) + side/desert
  let bestCombo = null;
  let bestScore = Infinity;

  for (let i = 0; i < enriched.length; i++) {
    for (let j = i + 1; j < enriched.length; j++) {
      const comboCals = enriched[i].calories + enriched[j].calories;
      const comboProtein = enriched[i].protein + enriched[j].protein;

      const calDiff = Math.abs(comboCals - targetCalories);
      const proteinDiff = Math.abs(comboProtein - targetProtein);
      const score = calDiff * 1.5 + proteinDiff * 2;

      if (score < bestScore) {
        bestScore = score;
        bestCombo = {
          items: [enriched[i], enriched[j]],
          totalCalories: comboCals,
          totalProtein: comboProtein,
          totalPrice: enriched[i].price + enriched[j].price
        };
      }
    }
  }

  return bestCombo;
};
