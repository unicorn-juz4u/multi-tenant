import React from 'react';
import { getStatusBadgeVariant, getRoleBadgeVariant } from '../utils/formatters.js';

export const Badge = ({ variant = 'default', type = 'custom', value, children, className = '' }) => {
  let styleClasses = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  let label = children || value;

  if (type === 'status' && value) {
    const config = getStatusBadgeVariant(value);
    styleClasses = config.bg;
    label = config.label;
  } else if (type === 'role' && value) {
    const config = getRoleBadgeVariant(value);
    styleClasses = config.bg;
    label = config.label;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClasses} ${className}`}
    >
      {label}
    </span>
  );
};

export default Badge;
