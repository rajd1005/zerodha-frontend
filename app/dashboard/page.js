"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, LogOut, RefreshCw, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState({ equity: 0, commodity: 0 });
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const localUser = JSON.parse(localStorage.getItem('user'));
      setUser(localUser);

      // Only fetch balance and positions if the user is in Live mode
      if (localUser.tradeMode === 'live') {
        const balRes = await axios.get(`${API_URL}/data/balance`, config);
        setBalance(balRes.data);

        const posRes = await axios.get(`${API_URL}/data/positions`, config);
        setPositions(posRes.data.net || []);
      } else {
        // If paper trading, fetch paper history
        const paperRes = await axios.get(`${API_URL}/trades/paper-history`, config);
        setPositions(paperRes.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleMode = async () => {
    try {
      const token = localStorage.getItem('token');
      const newMode = user.tradeMode === 'paper' ? 'live' : 'paper';
      
      const res = await axios.put(`${API_URL}/trades/mode`, { mode: newMode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local storage and state
      const updatedUser = { ...user, tradeMode: res.data.user.tradeMode };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      fetchDashboardData();
    } catch (error) {
      alert("Failed to switch modes");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading && !user) return <div className="p-6 text-center text-gray-500 mt-20">Loading Data...</div>;

  return (
    <div className="p-6">
      {/* Header Profile area */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hello, {user?.name?.split(' ')[0]}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <button onClick={handleLogout} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Trade Mode Toggle */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${user?.tradeMode === 'live' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Trading Mode</p>
            <p className="text-xs text-gray-500 uppercase">{user?.tradeMode}</p>
          </div>
        </div>
        <button 
          onClick={toggleMode}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl active:scale-95 transition"
        >
          Switch to {user?.tradeMode === 'paper' ? 'LIVE' : 'PAPER'}
        </button>
      </div>

      {/* Balance Card (Only shows in live mode) */}
      {user?.tradeMode === 'live' && (
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-lg shadow-blue-200 mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
            <Wallet className="w-32 h-32 -mt-4 -mr-4" />
          </div>
          <p className="text-blue-100 text-sm font-medium mb-1">Available Margin</p>
          <h3 className="text-4xl font-bold tracking-tight mb-4">₹{balance.equity.toLocaleString()}</h3>
          <button onClick={fetchDashboardData} className="flex items-center gap-2 text-xs bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition w-max">
            <RefreshCw className="w-3 h-3" /> Refresh Balance
          </button>
        </div>
      )}

      {/* Positions List */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Current Positions</h3>
        {positions.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-sm">No active positions right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {positions.map((pos, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">{pos.tradingsymbol || pos.symbol}</p>
                  <p className="text-xs text-gray-500">Qty: {pos.quantity} • {pos.product}</p>
                </div>
                <div className="text-right">
                  {/* Handle Live MTM vs Paper PNL */}
                  <p className={`font-bold ${pos.m2m > 0 || pos.pnl > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{pos.m2m || pos.pnl || 0}
                  </p>
                  <p className="text-xs text-gray-500 uppercase">{pos.status || 'LIVE'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
