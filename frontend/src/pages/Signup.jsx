import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { User, Mail, Lock, Shield, UserPlus, AlertCircle, Briefcase, PlusCircle } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'victim'
  });
  const [error, setError] = useState('');
  const [rawError, setRawError] = useState('');
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(formData);
      // Mandatory DigiLocker routing instantly post-registration (routes to prototype UI)
      navigate('/verify-digilocker');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setRawError(JSON.stringify(err.response?.data || err.message, null, 2));
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-6">
      <div className="industrial-card p-12 space-y-10 relative bg-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-900" />
        
        <div className="text-center space-y-6">
          <div className="bg-gray-900 w-16 h-16 flex items-center justify-center mx-auto shadow-xl">
             <UserPlus className="text-white" size={32} />
          </div>
          <div className="space-y-1">
             <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic scale-y-110">Unit Induction</h1>
             <p className="tactical-text text-gray-400">Establishing Operational Identity</p>
          </div>
        </div>

        {error && (
          <div className="space-y-2">
            <div className="p-4 border border-red-100 bg-red-50 flex items-center gap-3 text-red-600">
              <AlertCircle size={18} />
              <p className="tactical-text text-[9px]">{error}</p>
            </div>
            {rawError && (
              <details className="bg-gray-900 p-4 border border-white/10">
                 <summary className="text-[7px] font-black uppercase text-gray-500 cursor-pointer">Deep Diagnostics (Raw Payload)</summary>
                 <pre className="text-[8px] font-mono text-emerald-500 mt-2 overflow-auto max-h-32">{rawError}</pre>
              </details>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="tactical-text text-gray-400">Full Name</label>
            <input
              type="text"
              required
              className="w-full bg-white border border-gray-200 p-5 font-mono text-xs font-bold tracking-tighter outline-none focus:border-gray-900 transition-all text-gray-900"
              placeholder="OPERATIONAL_NAME"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="tactical-text text-gray-400">Credential Email</label>
            <input
              type="email"
              required
              className="w-full bg-white border border-gray-200 p-5 font-mono text-xs font-bold tracking-tighter outline-none focus:border-gray-900 transition-all text-gray-900"
              placeholder="e.g. unit@aidsphere.net"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="tactical-text text-gray-400">Phone Node (Required)</label>
            <input
              type="tel"
              required
              className="w-full bg-white border border-gray-200 p-5 font-mono text-xs font-bold tracking-tighter outline-none focus:border-gray-900 transition-all text-gray-900"
              placeholder="+91-XXXXXXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="tactical-text text-gray-400">Secret Key</label>
            <input
              type="password"
              required
              className="w-full bg-white border border-gray-200 p-5 font-mono text-xs font-bold tracking-tighter outline-none focus:border-gray-900 transition-all text-gray-900"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter mt-1 italic">
              &gt; This is your unique operational secret (Password) for system entry. Do not share.
            </p>
          </div>

          <div className="space-y-4">
             <label className="tactical-text text-gray-400">Operational Role</label>
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
               {['victim', 'volunteer', 'ngo', 'admin', 'donor'].map((r) => (
                 <button
                   key={r}
                   type="button"
                   onClick={() => setFormData({...formData, role: r})}
                   className={`p-4 border transition-all text-center tactical-text text-[9px] uppercase font-black tracking-widest ${
                     formData.role === r 
                     ? 'bg-gray-900 text-white border-gray-900' 
                     : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                   }`}
                 >
                   {r}
                 </button>
               ))}
             </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-black text-white py-6 font-black text-xs uppercase tracking-[0.4em] transition-all active:scale-95 shadow-lg shadow-gray-200 mt-6"
          >
            CREATE IDENTITY LINK
          </button>
        </form>



        <p className="text-center tactical-text text-gray-400">
          Already Integrated?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800 border-b border-blue-200">Re-initialize Session</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
