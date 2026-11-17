/** Format a number in Indian ₹ style: ₹1,00,000.00 */
export function formatINR(amount, showDecimals = true) {
  if (amount == null || isNaN(amount)) return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `₹${formatted}`;
}

/** Compact format for large amounts: ₹1.5L, ₹2.3Cr */
export function formatINRCompact(amount) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return formatINR(num, false);
}
