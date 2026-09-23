import React from 'react';
import { AlertCircle, CheckCircle2, Clock3, Truck } from 'lucide-react';

const config = {
  ACTIVE: ['good', CheckCircle2, 'Active'],
  INACTIVE: ['neutral', Clock3, 'Inactive'],
  OPTIMAL: ['good', CheckCircle2, 'Optimal'],
  LOW_STOCK: ['warning', AlertCircle, 'Low Stock'],
  OUT_OF_STOCK: ['critical', AlertCircle, 'Out of Stock'],
  OPEN: ['critical', AlertCircle, 'Open'],
  ACKNOWLEDGED: ['warning', Clock3, 'Acknowledged'],
  RESOLVED: ['good', CheckCircle2, 'Resolved'],
  DELIVERED: ['good', CheckCircle2, 'Delivered'],
  IN_TRANSIT: ['warning', Truck, 'In Transit'],
  PENDING: ['neutral', Clock3, 'Pending'],
  CRITICAL: ['critical', AlertCircle, 'Critical'],
  WARNING: ['warning', AlertCircle, 'Warning'],
  INFO: ['neutral', Clock3, 'Info'],
};

const StatusBadge = ({ status }) => {
  const normalized = String(status || 'UNKNOWN').toUpperCase();
  const [tone, Icon, label] = config[normalized] || ['neutral', Clock3, normalized.replaceAll('_', ' ')];
  return <span className={`status-pill status-with-icon ${tone}`}><Icon size={12} /> {label}</span>;
};

export default StatusBadge;
