import React from 'react';

export default function SkeletonLoader({ width = '100%', height = 20, radius, style }) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius: radius || 'var(--radius-sm)',
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ height = 120 }) {
  return (
    <div className="card" style={{ padding: 'var(--space-md)' }}>
      <SkeletonLoader height={16} width="40%" style={{ marginBottom: 12 }} />
      <SkeletonLoader height={height - 50} />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
      <SkeletonLoader width={44} height={44} radius="50%" />
      <div style={{ flex: 1 }}>
        <SkeletonLoader height={14} width="60%" style={{ marginBottom: 6 }} />
        <SkeletonLoader height={12} width="30%" />
      </div>
      <SkeletonLoader height={16} width={60} />
    </div>
  );
}
