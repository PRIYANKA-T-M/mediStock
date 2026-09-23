import React from 'react';

const MetricCard = ({ title, value, icon: Icon, tone = 'blue', subtitle }) => (
  <div className="metric-card metric-card-v2">
    <div>
      <p className="metric-title">{title}</p>
      <h3 className="metric-value">{value}</h3>
      {subtitle && <small className="metric-subtitle">{subtitle}</small>}
    </div>
    <div className={`metric-icon metric-icon-${tone}`}>
      <Icon size={22} />
    </div>
  </div>
);

export default MetricCard;
