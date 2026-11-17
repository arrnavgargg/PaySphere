import React from 'react';
import { useNavigate } from 'react-router-dom';
import GreetingCard from '../components/home/GreetingCard';
import BalanceCard from '../components/home/BalanceCard';
import QuickActions from '../components/home/QuickActions';
import RecentPayees from '../components/home/RecentPayees';
import RecentTransactions from '../components/home/RecentTransactions';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName = user?.fullName?.split(' ')[0] || 'User';

  const handlePayeeSelect = (payee) => {
    navigate('/pay', { state: { mode: 'UPI', payeeId: payee.upi, payeeName: payee.name } });
  };

  return (
    <div className="page fade-in">
      <GreetingCard name={displayName} />
      <BalanceCard />
      <QuickActions />
      <RecentPayees onSelect={handlePayeeSelect} />
      <RecentTransactions />
    </div>
  );
}
