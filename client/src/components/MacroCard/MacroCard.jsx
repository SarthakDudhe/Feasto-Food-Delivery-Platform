import React, { useContext } from 'react';
import './MacroCard.css';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';

const MacroCard = ({ item }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);

  const {
    _id,
    name,
    price,
    description,
    image,
    calories,
    protein,
    carbs,
    fat,
    proteinRatio,
    carbRatio,
    fatRatio,
    tags
  } = item;

  const count = cartItems ? cartItems[_id] || 0 : 0;

  return (
    <div className="macro-card">
      <div className="macro-card-img-wrapper">
        <img
          src={url ? `${url}/images/${image}` : image}
          alt={name}
          className="macro-card-img"
          loading="lazy"
          decoding="async"
        />
        <div className="macro-calorie-badge">
          <span>🔥 {calories}</span> <small>kcal</small>
        </div>
      </div>

      <div className="macro-card-body">
        <div className="macro-card-header">
          <h3 className="macro-item-title">{name}</h3>
          <span className="macro-item-price">${price}</span>
        </div>

        <p className="macro-item-desc">{description}</p>

        {/* Dietary Tag Badges */}
        <div className="macro-tags">
          {tags && tags.map((t, idx) => (
            <span key={idx} className={`macro-tag ${t.toLowerCase().replace(/\s+/g, '-')}`}>
              {t}
            </span>
          ))}
        </div>

        {/* Macro Numbers Grid */}
        <div className="macro-stats-grid">
          <div className="macro-stat protein">
            <span className="stat-label">Protein</span>
            <span className="stat-val">{protein}g</span>
          </div>
          <div className="macro-stat carbs">
            <span className="stat-label">Carbs</span>
            <span className="stat-val">{carbs}g</span>
          </div>
          <div className="macro-stat fat">
            <span className="stat-label">Fat</span>
            <span className="stat-val">{fat}g</span>
          </div>
        </div>

        {/* Visual Ratio Progress Bar */}
        <div className="macro-bar-container" title={`Protein: ${proteinRatio}%, Carbs: ${carbRatio}%, Fat: ${fatRatio}%`}>
          <div className="macro-bar-segment protein-seg" style={{ width: `${proteinRatio}%` }}></div>
          <div className="macro-bar-segment carbs-seg" style={{ width: `${carbRatio}%` }}></div>
          <div className="macro-bar-segment fat-seg" style={{ width: `${fatRatio}%` }}></div>
        </div>

        {/* Cart Counter Actions */}
        <div className="macro-card-actions">
          {count === 0 ? (
            <button className="btn-add-macro" onClick={() => addToCart(_id)}>
              Add to Healthy Cart +
            </button>
          ) : (
            <div className="macro-counter">
              <button onClick={() => removeFromCart(_id)}>-</button>
              <span>{count}</span>
              <button onClick={() => addToCart(_id)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MacroCard;
