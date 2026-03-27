import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto py-24 px-6">
      <div className="industrial-card p-12 space-y-10 relative bg-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-900" />
        
        <div className="text-center space-y-6">
          <div className="bg-gray-900 w-16 h-16 flex items-center justify-center mx-auto shadow-xl">
             <ShieldAlert className="text-white" size={32} />
          </div>
          <div className="space-y-1">
             <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic scale-y-110">Access Link</h1>
             <p className="tactical-text text-gray-400">Tactical Interface Entry</p>
          </div>
        </div>

        {error && (
          <div className="p-4 border border-red-100 bg-red-50 flex items-center gap-3 text-red-600">
            <AlertCircle size={18} />
            <p className="tactical-text text-[9px]">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="tactical-text text-gray-400">Credential ID</label>
            <input
              type="email"
              required
              className="w-full bg-white border border-gray-200 p-5 font-mono text-xs font-bold tracking-tighter outline-none focus:border-gray-900 transition-all text-gray-900"
              placeholder="Operational Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="tactical-text text-gray-400">Secret Key</label>
            <input
              type="password"
              required
              className="w-full bg-white border border-gray-200 p-5 font-mono text-xs font-bold tracking-tighter outline-none focus:border-gray-900 transition-all text-gray-900"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-black text-white py-5 font-black text-xs uppercase tracking-[0.4em] transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            INITIALIZE SESSION
          </button>
        </form>

        <div className="relative py-4">
           <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
           <div className="relative flex justify-center text-[8px] uppercase font-black text-gray-400 bg-white px-4 tracking-[0.3em]">Identity Hub</div>
        </div>

        <button 
          onClick={async () => {
            try {
              const { data } = await API.get('/auth/digilocker-redirect');
              window.location.href = data.url;
            } catch (err) {
              setError("DigiLocker Uplink Failed");
            }
          }}
          className="w-full border-2 border-blue-600 text-blue-600 py-5 font-black text-xs uppercase tracking-[0.4em] hover:bg-blue-50 transition-all flex items-center justify-center gap-4 group"
        >
          <img src="https://www.digilocker.gov.in/assets/img/logo.png" alt="DigiLocker" className="h-5 grayscale group-hover:grayscale-0 transition-all" />
          Login via DigiLocker
        </button>

        <p className="text-center tactical-text text-gray-400">
           New Unit?{' '}
           <Link to="/signup" className="text-blue-600 hover:text-blue-800 border-b border-blue-200">Establish ID Link</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
