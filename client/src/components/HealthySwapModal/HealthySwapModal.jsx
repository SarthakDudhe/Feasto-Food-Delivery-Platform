import React, { useState, useContext } from 'react';
import './HealthySwapModal.css';
import { getHealthySwapsForItem } from '../../utils/macroCalculator';
import { StoreContext } from '../../context/StoreContext';

const HealthySwapModal = ({ item, isOpen, onClose }) => {
  const { addToCart } = useContext(StoreContext);
  const swaps = getHealthySwapsForItem(item || {});

  const [selectedSwaps, setSelectedSwaps] = useState([]);

  if (!isOpen || !item) return null;

  const toggleSwap = (swapId) => {
    setSelectedSwaps((prev) =>
      prev.includes(swapId) ? prev.filter((id) => id !== swapId) : [...prev, swapId]
    );
  };

  // Compute modified macros
  let savedCals = 0;
  let addedProt = 0;
  selectedSwaps.forEach((id) => {
    const found = swaps.find((s) => s.id === id);
    if (found) {
      savedCals += found.savedCalories;
      addedProt += found.addedProtein;
    }
  });

  const finalCals = Math.max(100, item.calories - savedCals);
  const finalProt = item.protein + addedProt;

  const handleAddToCartWithSwaps = () => {
    // Add item to cart
    addToCart(item._id);
    onClose();
  };

  return (
    <div className="swap-modal-overlay">
      <div className="swap-modal-card">
        <button className="swap-modal-close" onClick={onClose}>✕</button>

        <div className="swap-header">
          <span className="swap-badge">🪄 1-Click Healthy Customizer</span>
          <h2>{item.name}</h2>
          <p>Customize ingredients to save calories and boost protein before ordering.</p>
        </div>

        {/* Live Modified Stats Bar */}
        <div className="swap-live-stats">
          <div className="stat-box">
            <span className="box-lbl">Original</span>
            <span className="box-val">{item.calories} kcal | {item.protein}g P</span>
          </div>
          <div className="stat-box-arrow">➔</div>
          <div className="stat-box customized">
            <span className="box-lbl">Customized Dish</span>
            <span className="box-val">{finalCals} kcal | {finalProt}g P</span>
          </div>
        </div>

        {/* Swaps List */}
        <div className="swaps-options-list">
          {swaps.map((s) => {
            const isSelected = selectedSwaps.includes(s.id);
            return (
              <div
                key={s.id}
                className={`swap-item-row ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleSwap(s.id)}
              >
                <input type="checkbox" checked={isSelected} readOnly />
                <div className="swap-item-details">
                  <h4>{s.title}</h4>
                  <div className="swap-item-savings">
                    {s.savedCalories > 0 && <span className="save-cals">-{s.savedCalories} kcal</span>}
                    {s.addedProtein > 0 && <span className="add-prot">+{s.addedProtein}g Protein</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action button */}
        <button className="btn-confirm-healthy-swap" onClick={handleAddToCartWithSwaps}>
          Add Healthy Custom dish to Cart 🛒
        </button>
      </div>
    </div>
  );
};

export default HealthySwapModal;
