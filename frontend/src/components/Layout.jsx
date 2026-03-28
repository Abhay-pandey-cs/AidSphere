import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, ShieldAlert, Heart, Home, Users, MapPin, Globe, Activity, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import WeatherAlerts from '../pages/WeatherAlerts';

const Navbar = () => {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed top-0 w-full z-50 pointer-events-none">
      <nav className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-gray-900/10 pointer-events-auto">
        <Link to="/" className="flex items-center gap-3 group decoration-none">
          <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-600/20">
            <ShieldAlert size={20} />
          </div>
          <div className="flex flex-col">
             <span className="text-xl font-bold text-slate-800 tracking-tight leading-none">
               AidSphere
             </span>
             <span className="text-[10px] font-medium text-slate-500 tracking-wide uppercase mt-0.5">Relief Network</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-2">
          {[
            { name: 'Live Intel', path: '/map' },
            { name: 'Fundraising', path: '/fundraising' },
            { name: 'Social Watch', path: '/social-monitor' },
            ...(user && user.role === 'victim' ? [{ name: 'Support', path: '/mental-health' }] : []),
          ].map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className="text-slate-500 hover:text-slate-900 font-semibold text-sm px-4 py-2 transition-all decoration-none"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <Link to="/dashboard" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-full hover:bg-slate-50 transition-all decoration-none shadow-sm">
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link to="/account" className="p-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all decoration-none">
                <User size={18} />
              </Link>
              <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="font-semibold text-slate-500 hover:text-slate-900 text-sm decoration-none">Sign In</Link>
              <Link to="/signup" className="px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-full hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 transition-all decoration-none">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen selection:bg-blue-100 selection:text-blue-700">
      <Navbar />
      <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto">
        {children}
      </main>
      <WeatherAlerts />
      
      {/* Clean Footer */}
      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-3 text-slate-400">
              <Activity size={18} />
              <p className="text-xs font-medium tracking-wide">&copy; {new Date().getFullYear()} AidSphere Humanitarian Platform</p>
           </div>
           <div className="flex gap-8">
              {['Privacy Policy', 'Data Nodes', 'Terms of Service'].map(t => (
                <span key={t} className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer">{t}</span>
              ))}
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
