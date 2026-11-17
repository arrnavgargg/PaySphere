/**
 * Maps raw backend error messages to user-friendly text.
 * Fraud-related errors get a generic security message.
 */

const FRAUD_KEYWORDS = [
  'fraud', 'blacklist', 'anomaly', 'suspicious', 'blocked',
  'chain of responsibility', 'flagged',
];

const ERROR_MAP = {
  'Payment authorization failed': 'Payment failed. Please try again.',
  'Capture failed': 'We couldn\'t complete this payment. Please try again.',
  'Refund failed': 'Refund could not be processed. Please contact support.',
  'Failed to fetch transactions': 'Couldn\'t load your transactions. Pull down to refresh.',
  'Failed to fetch customers': 'Couldn\'t load account details. Please try again.',
  'Transaction not found': 'We couldn\'t find this transaction.',
};

export function friendlyError(rawMessage) {
  if (!rawMessage) return 'Something went wrong. Please try again.';

  const lower = rawMessage.toLowerCase();

  // Catch any fraud-related messages and show a generic security message
  if (FRAUD_KEYWORDS.some((kw) => lower.includes(kw))) {
    return 'We couldn\'t process this payment for your security. Contact support.';
  }

  // Check mapped messages
  for (const [key, friendly] of Object.entries(ERROR_MAP)) {
    if (lower.includes(key.toLowerCase())) return friendly;
  }

  // Generic fallback
  return 'Payment failed. Please try again.';
}
