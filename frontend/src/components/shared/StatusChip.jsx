import React from 'react';

/** Maps backend statuses to user-friendly labels and chip styles */
const STATUS_MAP = {
  AUTHORIZED: { label: 'Success', className: 'chip-success' },
  CAPTURED:   { label: 'Success', className: 'chip-success' },
  REFUNDED:   { label: 'Refunded', className: 'chip-warning' },
  FAILED:     { label: 'Failed', className: 'chip-danger' },
  PENDING:    { label: 'Pending', className: 'chip-info' },
};

export default function StatusChip({ status }) {
  const mapped = STATUS_MAP[status] || { label: status || 'Unknown', className: 'chip-info' };
  return <span className={`chip ${mapped.className}`}>{mapped.label}</span>;
}
