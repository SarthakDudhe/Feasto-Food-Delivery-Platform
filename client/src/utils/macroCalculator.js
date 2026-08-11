/**
 * Utility functions for calculating TDEE, Health Grades, Healthy Swaps, and Macro profiles
 */

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
 * Calculates BMR & TDEE based on Mifflin-St Jeor Formula
 */
export const calculateUserTDEE = (weightKg = 70, heightCm = 175, age = 25, gender = 'male', activity = 1.375, goal = 'loss') => {
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  bmr = gender === 'male' ? bmr + 5 : bmr - 161;

  let tdee = Math.round(bmr * activity);

  let targetCalories = tdee;
  if (goal === 'loss') targetCalories = Math.round(tdee - 450);
  if (goal === 'gain') targetCalories = Math.round(tdee + 350);

  // Protein target: ~1.8g per kg for loss/gain
  let targetProtein = Math.round(weightKg * 1.8);

  return {
    tdee,
    targetCalories: Math.max(1200, targetCalories),
    targetProtein: Math.max(40, targetProtein),
    mealCalorieTarget: Math.round(targetCalories / 3)
  };
};

/**
 * Calculates Health Grade (A+, A, B, C) based on protein density and calorie ratio
 */
export const calculateHealthGrade = (protein, calories, fiber = 4) => {
  const proteinDensity = (protein * 4) / (calories || 1);
  if (proteinDensity >= 0.35 && calories <= 450) return 'A+';
  if (proteinDensity >= 0.25 || (fiber >= 6 && calories <= 500)) return 'A';
  if (proteinDensity >= 0.15) return 'B';
  return 'C';
};

/**
 * Enriches a food item object with calculated macro parameters, health grade, and swaps
 */
export const getEnrichedMacroItem = (item) => {
  const cat = item.category || "Salad";
  const defaults = categoryMacroDefaults[cat] || categoryMacroDefaults["Salad"];

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

  const healthGrade = calculateHealthGrade(protein, calories, fiber);

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
    healthGrade,
    tags
  };
};

/**
 * Returns available 1-Click Healthy Swaps for a specific food item
 */
export const getHealthySwapsForItem = (item) => {
  const name = (item.name || "").toLowerCase();
  const swaps = [];

  if (name.includes("roll") || name.includes("sandwich") || name.includes("burger")) {
    swaps.push({
      id: "greek_yogurt_spread",
      title: "Swap Mayo for Greek Yogurt Spread",
      savedCalories: 110,
      addedProtein: 6,
      savedFat: 12,
      priceExtra: 0
    });
  }

  if (name.includes("salad") || name.includes("roll")) {
    swaps.push({
      id: "extra_grilled_chicken",
      title: "Add Extra Grilled Lean Protein (+15g P)",
      savedCalories: -60,
      addedProtein: 15,
      savedFat: 2,
      priceExtra: 2.5
    });
  }

  swaps.push({
    id: "dressing_on_side",
    title: "Light Dressing / Served on Side",
    savedCalories: 90,
    addedProtein: 0,
    savedFat: 9,
    priceExtra: 0
  });

  return swaps;
};

/**
 * Filter food items by target macro preset or custom ranges
 */
export const filterFoodByMacros = (foodList, filters) => {
  if (!foodList || !Array.isArray(foodList)) return [];

  return foodList
    .map(getEnrichedMacroItem)
    .filter((item) => {
      if (filters.preset === "high-protein" && item.protein < 22) return false;
      if (filters.preset === "low-calorie" && item.calories > 400) return false;
      if (filters.preset === "keto" && item.carbs > 30) return false;
      if (filters.preset === "vegan" && !item.tags.includes("Vegan") && !item.name.toLowerCase().includes("veg")) return false;

      if (filters.maxCalories && item.calories > filters.maxCalories) return false;
      if (filters.minProtein && item.protein < filters.minProtein) return false;
      if (filters.glutenFree && !item.tags.includes("Gluten-Free")) return false;

      return true;
    });
};

/**
 * Generates an AI Combo Meal matching a calorie/protein target
 */
export const generateAIMealCombo = (foodList, targetCalories = 600, targetProtein = 35) => {
  const enriched = (foodList || []).map(getEnrichedMacroItem);
  if (enriched.length === 0) return null;

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
