import React from "react";

export const FeatureCard = ({ title, description, className }) => {
  return (
    <div className={`p-4 rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};
