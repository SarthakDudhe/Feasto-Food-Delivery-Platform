import React, { useState } from 'react';
import './HealthGoalModal.css';
import { calculateUserTDEE } from '../../utils/macroCalculator';

const HealthGoalModal = ({ isOpen, onClose, onSaveTargets }) => {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('loss'); // 'loss', 'maintain', 'gain'
  const [gender, setGender] = useState('male');
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(175);
  const [age, setAge] = useState(25);
  const [activity, setActivity] = useState(1.375); // 1.2 = Sedentary, 1.375 = Moderate, 1.55 = Active

  if (!isOpen) return null;

  const calculated = calculateUserTDEE(weightKg, heightCm, age, gender, activity, goal);

  const handleFinish = () => {
    onSaveTargets({
      targetCalories: calculated.mealCalorieTarget * 2, // Meal budget
      mealCalorieTarget: calculated.mealCalorieTarget,
      targetProtein: calculated.targetProtein,
      tdee: calculated.tdee
    });
    onClose();
  };

  return (
    <div className="health-modal-overlay">
      <div className="health-modal-card">
        <button className="health-modal-close" onClick={onClose}>✕</button>

        <div className="modal-wizard-header">
          <span className="wizard-step-tag">Step {step} of 3</span>
          <h2>Personalize Your Health Targets</h2>
        </div>

        {step === 1 && (
          <div className="wizard-step-body">
            <h3>What is your primary fitness goal?</h3>
            <div className="goal-options-grid">
              <div
                className={`goal-card ${goal === 'loss' ? 'selected' : ''}`}
                onClick={() => setGoal('loss')}
              >
                <span className="goal-icon">🔥</span>
                <h4>Weight Loss &amp; Shred</h4>
                <p>Maintain calorie deficit with high protein retention</p>
              </div>

              <div
                className={`goal-card ${goal === 'maintain' ? 'selected' : ''}`}
                onClick={() => setGoal('maintain')}
              >
                <span className="goal-icon">⚖️</span>
                <h4>Clean Maintenance</h4>
                <p>Balanced macros to stay energetic and fit</p>
              </div>

              <div
                className={`goal-card ${goal === 'gain' ? 'selected' : ''}`}
                onClick={() => setGoal('gain')}
              >
                <span className="goal-icon">💪</span>
                <h4>Muscle &amp; Mass Gain</h4>
                <p>Calorie surplus paired with heavy protein intake</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step-body">
            <h3>Enter Your Body Parameters</h3>
            <div className="inputs-form-grid">
              <div className="input-field">
                <label>Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="input-field">
                <label>Weight (kg): {weightKg} kg</label>
                <input
                  type="range"
                  min="40"
                  max="140"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                />
              </div>

              <div className="input-field">
                <label>Height (cm): {heightCm} cm</label>
                <input
                  type="range"
                  min="130"
                  max="210"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                />
              </div>

              <div className="input-field">
                <label>Age: {age} yrs</label>
                <input
                  type="range"
                  min="16"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step-body">
            <h3>Your Calculated Daily Fuel Profile ✨</h3>
            <div className="calculated-results-card">
              <div className="result-stat">
                <span className="res-label">Est. TDEE (Daily Burn)</span>
                <span className="res-val">{calculated.tdee} kcal</span>
              </div>
              <div className="result-stat highlight">
                <span className="res-label">Recommended Meal Budget</span>
                <span className="res-val">{calculated.mealCalorieTarget} kcal</span>
              </div>
              <div className="result-stat highlight-prot">
                <span className="res-label">Daily Protein Target</span>
                <span className="res-val">{calculated.targetProtein} g</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="wizard-footer">
          {step > 1 && (
            <button className="btn-wizard-back" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < 3 ? (
            <button className="btn-wizard-next" onClick={() => setStep(step + 1)}>
              Next Step →
            </button>
          ) : (
            <button className="btn-wizard-finish" onClick={handleFinish}>
              Apply My Personalized Targets 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthGoalModal;
