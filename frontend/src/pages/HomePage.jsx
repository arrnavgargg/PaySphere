import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GreetingCard from '../components/home/GreetingCard';
import BalanceCard from '../components/home/BalanceCard';
import QuickActions from '../components/home/QuickActions';
import RecentPayees from '../components/home/RecentPayees';
import RecentTransactions from '../components/home/RecentTransactions';
import { getAllCustomers } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Arnav');

  useEffect(() => {
    getAllCustomers()
      .then((customers) => {
        if (customers && customers.length > 0 && customers[0].fullName) {
          const firstName = customers[0].fullName.split(' ')[0];
          setUserName(firstName);
        }
      })
      .catch(() => {});
  }, []);

  const handlePayeeSelect = (payee) => {
    navigate('/pay', { state: { mode: 'UPI', payeeId: payee.upi, payeeName: payee.name } });
  };

  return (
    <div className="page fade-in">
      <GreetingCard name={userName} />
      <BalanceCard />
      <QuickActions />
      <RecentPayees onSelect={handlePayeeSelect} />
      <RecentTransactions />
    </div>
  );
}
