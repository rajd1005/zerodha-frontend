"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Shield, Calendar, CheckCircle, XCircle, Plus, UserPlus, X } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New User Form State
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', isDemo: false, subscriptionDays: 30
  });

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
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/users`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("User Created Successfully");
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', isDemo: false, subscriptionDays: 30 });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Error creating user");
    }
  };

  const handleUpdateUser = async (userId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/admin/users/${userId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <div className="p-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="text-blue-600" /> Admin Panel
        </h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg active:scale-95 transition"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* User Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute right-4 top-4 text-gray-400"><X /></button>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><UserPlus className="text-blue-600"/> New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <input required placeholder="Full Name" className="w-full p-3 bg-gray-50 border rounded-xl" onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="email" placeholder="Email Address" className="w-full p-3 bg-gray-50 border rounded-xl" onChange={e => setFormData({...formData, email: e.target.value})} />
              <input required type="password" placeholder="Initial Password" className="w-full p-3 bg-gray-50 border rounded-xl" onChange={e => setFormData({...formData, password: e.target.value})} />
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium">Demo Access?</span>
                <input type="checkbox" className="w-5 h-5" onChange={e => setFormData({...formData, isDemo: e.target.checked})} />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Initial Subscription (Days)</label>
                <input type="number" value={formData.subscriptionDays} className="w-full p-3 bg-gray-50 border rounded-xl" onChange={e => setFormData({...formData, subscriptionDays: e.target.value})} />
              </div>

              <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold mt-4">Create & Activate User</button>
            </form>
          </div>
        </div>
      )}

      {/* User List Rendering (Same as before but with fetch logic) */}
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900">{user.name}</h3>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {user.isActive ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => handleUpdateUser(user._id, { isActive: !user.isActive })} className="flex-1 text-xs py-2 bg-gray-100 rounded-lg font-bold">Toggle Status</button>
              <button onClick={() => handleUpdateUser(user._id, { subscriptionDaysToAdd: 30 })} className="flex-1 text-xs py-2 bg-blue-50 text-blue-600 rounded-lg font-bold">+30 Days</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
