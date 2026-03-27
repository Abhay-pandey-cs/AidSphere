import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import VolunteerDashboard from './VolunteerDashboard';
import VictimDashboard from './VictimDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
      <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-gray-400 font-black uppercase tracking-[0.4em] animate-pulse italic">Initializing Neural Link...</p>
    </div>
  );

  // Direct Role Routing
  if (user.role === 'admin' || user.role === 'govt') {
    return <AdminDashboard />;
  }

  if (user.role === 'volunteer') {
    return <VolunteerDashboard />;
  }

  if (user.role === 'ngo') {
    return <VolunteerDashboard />; // NGOs shared similar base logic for mission response
  }

  return <VictimDashboard />;
};

export default Dashboard;
