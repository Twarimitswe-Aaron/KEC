import React from 'react';
import DashboardStats from '../Components/DashboardStats';
import GrapshSection from '../Components/GrapshSection';
import AdditionalData from '../Components/AdditionalData';
const Dashboard = () => {
  return (
    <div>
      <DashboardStats />
      <GrapshSection/>
      <AdditionalData/>
    </div>
  );
};

export default Dashboard; 