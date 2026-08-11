import React, { useContext, useMemo } from 'react';
import './MacroFuelGauge.css';
import { StoreContext } from '../../context/StoreContext';
import { getEnrichedMacroItem } from '../../utils/macroCalculator';

const MacroFuelGauge = ({ userTargetCals = 650, userTargetProtein = 45, onOpenGoalWizard }) => {
  const { cartItems, food_list } = useContext(StoreContext);

  // Compute live totals from current cart
  const cartTotals = useMemo(() => {
    let totalCals = 0;
    let totalProt = 0;

    if (cartItems && food_list) {
      Object.keys(cartItems).forEach((id) => {
        const qty = cartItems[id];
        if (qty > 0) {
          const raw = food_list.find((p) => p._id === id);
          if (raw) {
            const enriched = getEnrichedMacroItem(raw);
            totalCals += enriched.calories * qty;
            totalProt += enriched.protein * qty;
          }
        }
      });
    }

    return { totalCals, totalProt };
  }, [cartItems, food_list]);

  const calPercent = Math.min(100, Math.round((cartTotals.totalCals / userTargetCals) * 100));
  const protPercent = Math.min(100, Math.round((cartTotals.totalProt / userTargetProtein) * 100));

  const isOverCal = cartTotals.totalCals > userTargetCals;

  return (
    <div className="macro-fuel-gauge-card">
      <div className="gauge-header">
        <div className="gauge-title-box">
          <span className="gauge-pulse-dot"></span>
          <h4>Live Macro Fuel Gauge (Cart Tracker)</h4>
        </div>
        {onOpenGoalWizard && (
          <button className="btn-edit-target" onClick={onOpenGoalWizard}>
            ⚙️ Personalize Targets
          </button>
        )}
      </div>

      <div className="gauge-body">
        {/* Calorie Progress */}
        <div className="gauge-metric">
          <div className="metric-info">
            <span className="metric-name">⚡ Calories Budget</span>
            <span className={`metric-value ${isOverCal ? 'over-limit' : ''}`}>
              {cartTotals.totalCals} / {userTargetCals} kcal
            </span>
          </div>
          <div className="metric-bar-bg">
            <div
              className={`metric-bar-fill cal-fill ${isOverCal ? 'over-fill' : ''}`}
              style={{ width: `${calPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Protein Progress */}
        <div className="gauge-metric">
          <div className="metric-info">
            <span className="metric-name">💪 Protein Goal</span>
            <span className="metric-value">
              {cartTotals.totalProt} / {userTargetProtein} g ({protPercent}%)
            </span>
          </div>
          <div className="metric-bar-bg">
            <div
              className="metric-bar-fill prot-fill"
              style={{ width: `${protPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="gauge-footer-note">
        {isOverCal ? (
          <span className="note-alert">⚠️ Your cart exceeds your target meal calorie budget! Consider light swaps.</span>
        ) : cartTotals.totalCals === 0 ? (
          <span>Add healthy dishes to your cart to see live calorie &amp; protein tracking.</span>
        ) : (
          <span className="note-good">✨ Great choice! You have {userTargetCals - cartTotals.totalCals} kcal remaining for this meal.</span>
        )}
      </div>
    </div>
  );
};

export default MacroFuelGauge;
