import React from 'react';

export default function GreetingCard({ name }) {
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  return (
    <div style={{ marginBottom: 'var(--space-lg)' }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{greeting} 👋</p>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{name || 'User'}</h1>
    </div>
  );
}
