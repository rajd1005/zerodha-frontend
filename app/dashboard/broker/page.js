"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Key, Plus, Save, RefreshCw } from 'lucide-react';

export default function BrokerPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [brokerName, setBrokerName] = useState('Zerodha');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [accountAlias, setAccountAlias] = useState('');
  const [lotMultiplier, setLotMultiplier] = useState(1);
  const [accessTokenInputs, setAccessTokenInputs] = useState({});

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/brokers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(res.data);
    } catch (error) {
      console.error("Failed to fetch broker accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/brokers`, {
        brokerName, apiKey, apiSecret, accountAlias, lotMultiplier: Number(lotMultiplier)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowAddForm(false);
      setApiKey(''); setApiSecret(''); setAccountAlias(''); setLotMultiplier(1);
      fetchAccounts();
    } catch (error) {
      alert("Failed to add account: " + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateToken = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const accessToken = accessTokenInputs[id];
      if (!accessToken) return alert("Please enter an access token");

      await axios.put(`${API_URL}/brokers/${id}/token`, { accessToken }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Token updated successfully!");
      setAccessTokenInputs({ ...accessTokenInputs, [id]: '' });
      fetchAccounts();
    } catch (error) {
      alert("Failed to update token");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Key className="text-blue-600" /> Brokers
        </h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-blue-600 text-white rounded-full shadow-lg active:scale-95 transition"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Add New Broker Form */}
      {showAddForm && (
        <form onSubmit={handleAddAccount} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col gap-4">
          <h3 className="font-semibold text-gray-900 border-b pb-2 mb-2">Link New Account</h3>
          
          <input required placeholder="Account Alias (e.g., Wife's Acc)" value={accountAlias} onChange={(e) => setAccountAlias(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm text-gray-900" />
          <input required placeholder="Zerodha API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm text-gray-900" />
          <input required type="password" placeholder="Zerodha API Secret" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm text-gray-900" />
          
          <div>
            <label className="text-xs text-gray-500 ml-1">Lot Multiplier (Copy Trading)</label>
            <input required type="number" min="0.1" step="0.1" value={lotMultiplier} onChange={(e) => setLotMultiplier(e.target.value)} className="w-full mt-1 px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm text-gray-900" />
          </div>

          <button type="submit" className="mt-2 w-full bg-blue-600 text-white font-semibold py-3 rounded-xl shadow-md active:scale-95 transition flex justify-center items-center gap-2">
            <Save className="w-4 h-4" /> Save Account
          </button>
        </form>
      )}

      {/* List of Connected Accounts */}
      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading accounts...</p>
      ) : accounts.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500 text-sm">
          No broker accounts linked. Click the + button to add your Zerodha API.
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((acc) => (
            <div key={acc._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{acc.accountAlias || acc.brokerName}</h3>
                  <p className="text-xs text-gray-500 font-mono">Key: {acc.apiKey.substring(0, 5)}...{acc.apiKey.slice(-4)}</p>
                </div>
                <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg">
                  {acc.lotMultiplier}x Multiplier
                </div>
              </div>

              {/* Daily Access Token Input */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="text-xs text-gray-500 font-medium mb-1 block">Daily Access Token</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder={acc.accessToken ? "Token active" : "Paste daily token here"}
                    value={accessTokenInputs[acc._id] || ''}
                    onChange={(e) => setAccessTokenInputs({ ...accessTokenInputs, [acc._id]: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm text-gray-900"
                  />
                  <button 
                    onClick={() => handleUpdateToken(acc._id)}
                    className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium active:scale-95 transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
