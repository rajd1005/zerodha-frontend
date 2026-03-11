"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Shield, Calendar, Edit2, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      setError("Failed to fetch users. Ensure you are logged in as an Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateUser = async (userId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/admin/users/${userId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("User updated successfully!");
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert("Failed to update user. " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500 mt-20">Loading Users...</div>;

  if (error) return (
    <div className="p-6 text-center mt-20">
      <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-red-600 font-bold">{error}</p>
    </div>
  );

  return (
    <div className="p-6 pb-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Shield className="text-blue-600 w-7 h-7" /> Admin Panel
      </h2>

      <div className="space-y-4">
        {users.map((user) => (
          <div key={user._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            
            {/* User Header */}
            <div className="flex justify-between items-start border-b border-gray-50 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                  {user.role}
                </span>
              </div>
              <div className="text-right">
                <span className={`flex items-center gap-1 text-xs font-bold ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>

            {/* Subscription & Demo Status */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Demo Mode</p>
                <p className="font-semibold text-gray-900">{user.isDemo ? 'Enabled' : 'Disabled'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Subscription Ends</p>
                <p className="font-semibold text-gray-900">
                  {user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-2">
              <button 
                onClick={() => handleUpdateUser(user._id, { isActive: !user.isActive })}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
              >
                {user.isActive ? 'Deactivate' : 'Activate'}
              </button>
              
              <button 
                onClick={() => handleUpdateUser(user._id, { isDemo: !user.isDemo })}
                className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition"
              >
                Toggle Demo
              </button>

              <button 
                onClick={() => handleUpdateUser(user._id, { subscriptionDaysToAdd: 30 })}
                className="w-full py-2 px-3 bg-gray-900 text-white active:scale-95 rounded-xl text-xs font-bold transition flex justify-center items-center gap-2 mt-1"
              >
                <Calendar className="w-4 h-4" /> Add 30 Days Access
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
