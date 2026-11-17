import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StepMethodSelect from '../components/pay/StepMethodSelect';
import StepPayeeInput from '../components/pay/StepPayeeInput';
import StepAmountInput from '../components/pay/StepAmountInput';
import StepReview from '../components/pay/StepReview';
import StepPinEntry from '../components/pay/StepPinEntry';
import StepProcessing from '../components/pay/StepProcessing';
import StepResult from '../components/pay/StepResult';
import { authorizePayment } from '../services/api';
import { useIdempotency } from '../hooks/useIdempotency';
import { friendlyError } from '../utils/errorMessages';
import { useToast } from '../context/ToastContext';

const STEPS = ['method', 'payee', 'amount', 'review', 'pin', 'processing', 'result'];

export default function PayFlow() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getKey, reset } = useIdempotency();
  const { addToast } = useToast();

  const initialMode = location.state?.mode || '';
  const initialPayee = location.state?.payeeId || '';

  const [step, setStep] = useState(initialMode ? (initialPayee ? 'amount' : 'payee') : 'method');
  const [mode, setMode] = useState(initialMode || 'UPI');
  const [payee, setPayee] = useState(initialPayee);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const goBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx <= 0) {
      navigate('/');
    } else {
      setStep(STEPS[idx - 1]);
    }
  };

  const handleMethodSelect = (m) => {
    setMode(m);
    setStep('payee');
  };

  const handlePayeeVerified = () => {
    setStep('amount');
  };

  const handleAmountContinue = () => {
    setStep('review');
  };

  const handleConfirm = () => {
    setStep('pin');
  };

  const handlePinSubmit = async () => {
    setStep('processing');
    setLoading(true);

    const payload = {
      idempotencyKey: getKey(),
      amount: parseFloat(amount),
      currency: 'INR',
      paymentMode: mode,
      identifier: mode === 'CREDIT_CARD' ? payee.replace(/\s/g, '') : payee,
    };

    try {
      const res = await authorizePayment(payload);
      // Automatically capture after authorization for consumer flow
      setResult(res);
      setStep('result');
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(friendlyError(err.message));
      setResult(null);
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    reset();
    navigate('/');
  };

  const handleRetry = () => {
    // Reuse the same idempotency key for retry to prevent double charges
    setStep('review');
    setResult(null);
    setErrorMsg('');
  };

  const showBack = !['processing', 'result'].includes(step);
  const stepIdx = STEPS.indexOf(step);
  const progress = Math.min(((stepIdx + 1) / STEPS.length) * 100, 100);

  return (
    <div className="page">
      {/* Top bar with back + progress */}
      {showBack && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
            <button
              onClick={goBack}
              className="btn btn-ghost"
              style={{ padding: 8, borderRadius: 'var(--radius-full)' }}
              aria-label="Go back"
            >
              <ArrowLeft size={22} />
            </button>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              {step === 'method' ? 'Pay' : step === 'payee' ? 'Recipient' : step === 'amount' ? 'Amount' : step === 'review' ? 'Confirm' : 'Authorize'}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: 3, background: 'var(--color-border)', borderRadius: 2 }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--color-accent)',
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}

      {step === 'method' && (
        <StepMethodSelect selected={mode} onSelect={handleMethodSelect} />
      )}
      {step === 'payee' && (
        <StepPayeeInput mode={mode} value={payee} onChange={setPayee} onVerified={handlePayeeVerified} />
      )}
      {step === 'amount' && (
        <StepAmountInput
          amount={amount}
          onAmountChange={setAmount}
          note={note}
          onNoteChange={setNote}
          onContinue={handleAmountContinue}
        />
      )}
      {step === 'review' && (
        <StepReview
          mode={mode}
          payee={payee}
          amount={amount}
          note={note}
          onConfirm={handleConfirm}
          loading={loading}
        />
      )}
      {step === 'pin' && (
        <StepPinEntry mode={mode} onSubmit={handlePinSubmit} />
      )}
      {step === 'processing' && (
        <StepProcessing />
      )}
      {step === 'result' && (
        <StepResult
          success={!errorMsg && result}
          result={result}
          errorMessage={errorMsg}
          onDone={handleDone}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
