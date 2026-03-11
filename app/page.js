"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'navigation'; // Fix: Next.js 13+ uses next/navigation
import { Lock, Mail, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Use your live Railway backend URL here
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-railway-app-url.up.railway.app/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      // Save the JWT token securely
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));

      // Redirect to the dashboard
      window.location.href = '/dashboard';
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen px-6 pt-20 pb-10">
      
      {/* App Logo & Header */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
          <TrendingUp className="text-white w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Trade Manager</h1>
        <p className="text-gray-500 mt-2 text-sm">Sign in to manage your connected accounts</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4 flex-grow">
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-gray-900"
            placeholder="Email Address"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-gray-900"
            placeholder="Password"
          />
        </div>

        <div className="flex justify-end mt-1">
          <button type="button" className="text-blue-600 text-sm font-semibold hover:underline">
            Forgot Password?
          </button>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex justify-center items-center"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Log In"
          )}
        </button>
      </form>
    </div>
  );
}
