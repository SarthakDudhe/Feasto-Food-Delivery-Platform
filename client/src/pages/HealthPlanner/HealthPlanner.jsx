import React, { useContext, useState, useMemo } from 'react';
import './HealthPlanner.css';
import { StoreContext } from '../../context/StoreContext';
import { filterFoodByMacros, generateAIMealCombo, getEnrichedMacroItem } from '../../utils/macroCalculator';
import MacroCard from '../../components/MacroCard/MacroCard';

const HealthPlanner = () => {
  const { food_list } = useContext(StoreContext);

  const [activePreset, setActivePreset] = useState("all");
  const [maxCalories, setMaxCalories] = useState(800);
  const [minProtein, setMinProtein] = useState(0);
  const [glutenFreeOnly, setGlutenFreeOnly] = useState(false);
  const [aiCombo, setAiCombo] = useState(null);

  // Compute filtered items
  const filteredDishes = useMemo(() => {
    return filterFoodByMacros(food_list, {
      preset: activePreset,
      maxCalories,
      minProtein,
      glutenFree: glutenFreeOnly
    });
  }, [food_list, activePreset, maxCalories, minProtein, glutenFreeOnly]);

  const handleGenerateCombo = () => {
    const combo = generateAIMealCombo(food_list, maxCalories, minProtein || 35);
    setAiCombo(combo);
  };

  return (
    <div className="health-planner-page">
      {/* Hero Header */}
      <section className="health-hero">
        <span className="health-hero-eyebrow">Feasto Smart Health Assistant 🥗</span>
        <h1 className="health-hero-title">Fuel Your Body with Macro Precision</h1>
        <p className="health-hero-sub">
          Set your calorie limit, hit your protein goals, and discover chef-crafted meals designed for your fitness journey.
        </p>

        {/* Goal Preset Chips */}
        <div className="preset-chips-container">
          <button
            className={`preset-chip ${activePreset === 'all' ? 'active' : ''}`}
            onClick={() => setActivePreset('all')}
          >
            🌟 All Health Options
          </button>
          <button
            className={`preset-chip ${activePreset === 'high-protein' ? 'active' : ''}`}
            onClick={() => setActivePreset('high-protein')}
          >
            💪 High Protein (&gt;22g)
          </button>
          <button
            className={`preset-chip ${activePreset === 'low-calorie' ? 'active' : ''}`}
            onClick={() => setActivePreset('low-calorie')}
          >
            🔥 Weight Loss (&lt;400 kcal)
          </button>
          <button
            className={`preset-chip ${activePreset === 'keto' ? 'active' : ''}`}
            onClick={() => setActivePreset('keto')}
          >
            🥑 Keto &amp; Low Carb
          </button>
          <button
            className={`preset-chip ${activePreset === 'vegan' ? 'active' : ''}`}
            onClick={() => setActivePreset('vegan')}
          >
            🌱 Plant-Based Pure Veg
          </button>
        </div>
      </section>

      {/* Control Panel */}
      <section className="health-controls-card">
        <div className="control-group">
          <label>
            Max Calories: <strong>{maxCalories} kcal</strong>
          </label>
          <input
            type="range"
            min="200"
            max="1000"
            step="25"
            value={maxCalories}
            onChange={(e) => setMaxCalories(Number(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>
            Min Protein: <strong>{minProtein}g</strong>
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="2"
            value={minProtein}
            onChange={(e) => setMinProtein(Number(e.target.value))}
          />
        </div>

        <div className="control-group checkbox-group">
          <label className="custom-checkbox">
            <input
              type="checkbox"
              checked={glutenFreeOnly}
              onChange={(e) => setGlutenFreeOnly(e.target.checked)}
            />
            <span>Gluten-Free Only 🌾</span>
          </label>
        </div>

        <button className="btn-ai-combo" onClick={handleGenerateCombo}>
          ✨ AI Build My Meal Plan Combo
        </button>
      </section>

      {/* AI Combo Result Modal / Banner */}
      {aiCombo && (
        <div className="ai-combo-box">
          <div className="ai-combo-header">
            <h3>✨ AI Suggested Meal Combo</h3>
            <button onClick={() => setAiCombo(null)}>✕</button>
          </div>
          <div className="ai-combo-summary">
            <span>Total: <strong>{aiCombo.totalCalories} kcal</strong></span>
            <span>Protein: <strong>{aiCombo.totalProtein}g</strong></span>
            <span>Combined Price: <strong>${aiCombo.totalPrice}</strong></span>
          </div>
          <div className="ai-combo-items">
            {aiCombo.items.map((item) => (
              <div key={item._id} className="ai-combo-pill">
                <span>{item.name}</span>
                <small>({item.calories} kcal | {item.protein}g P)</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dishes Grid Header */}
      <div className="health-grid-header">
        <h2>Dishes Matching Your Goals ({filteredDishes.length})</h2>
      </div>

      {/* Dishes Grid */}
      <div className="health-dishes-grid">
        {filteredDishes.length === 0 ? (
          <div className="no-macro-dishes">
            <p>No dishes fit these exact macro parameters. Try adjusting your calorie slider or protein target!</p>
          </div>
        ) : (
          filteredDishes.map((item) => (
            <MacroCard key={item._id} item={item} />
          ))
        )}
      </div>
    </div>
  );
};

export default HealthPlanner;
