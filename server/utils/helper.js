// Reject math-only or nonsense inputs
const INVALID_PATTERN = /^[\d\s+\-*/().]+$/;

// Common non-food words to remove
const STOP_WORDS = [
  "recipe", "how to", "how", "make", "cook", "prepare",
  "instructions", "steps", "guide", "please", "want",
  "tell me", "give me", "show me"
];

export const extractContext = (userText) => {
  if (!userText || typeof userText !== "string") {
    return {
      valid: false,
      message: "Please tell me the name of the dish you want a recipe for 🍽️"
    };
  }

  // Lowercase
  let cleanedText = userText.toLowerCase();

  // Reject math / symbols only (e.g. 1+1)
  if (INVALID_PATTERN.test(cleanedText)) {
    return {
      valid: false,
      message: "Please tell me the name of a food dish 🍔"
    };
  }

  // Remove stop words
  STOP_WORDS.forEach(word => {
    cleanedText = cleanedText.replace(new RegExp(word, "gi"), "");
  });

  // Remove non-letters
  cleanedText = cleanedText
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Final validation
  if (!cleanedText || cleanedText.length < 2) {
    return {
      valid: false,
      message: "Please tell me the name of a food dish 🍕"
    };
  }

  return {
    valid: true,
    foodItem: cleanedText
  };
};

