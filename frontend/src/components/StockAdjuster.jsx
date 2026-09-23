import React from 'react';

const StockAdjuster = ({ quantity, onIncrease, onDecrease, disabled = false }) => (
  <div className="stock-adjuster">
    <button type="button" onClick={onDecrease} disabled={disabled || quantity <= 0} aria-label="Decrease stock">−</button>
    <span>{quantity}</span>
    <button type="button" onClick={onIncrease} disabled={disabled} aria-label="Increase stock">+</button>
  </div>
);

export default StockAdjuster;
