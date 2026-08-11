import React from 'react';
import './Skeleton.css';

export const FoodItemSkeleton = () => {
  return (
    <div className="food-item-skeleton">
      <div className="skeleton-img pulse"></div>
      <div className="skeleton-info">
        <div className="skeleton-title pulse"></div>
        <div className="skeleton-desc pulse"></div>
        <div className="skeleton-desc short pulse"></div>
        <div className="skeleton-price pulse"></div>
      </div>
    </div>
  );
};

export const SectionSkeleton = () => {
  return (
    <div className="section-skeleton pulse">
      <div className="skeleton-bar"></div>
    </div>
  );
};
