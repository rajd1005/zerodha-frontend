"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      });

      // On success, save token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));

      // Redirect to dashboard
      window.location.href = '/dashboard';
      
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen px-6 pt-12 pb-10 overflow-y-auto">
      
      {/* Back Button */}
      <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Login</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
          <TrendingUp className="text-white w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h1>
        <p className="text-gray-500 mt-2 text-sm text-center">Join the multi-trade management system</p>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleRegister} className="flex flex-col gap-4 flex-grow">
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Name Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-gray-900"
            placeholder="Full Name"
          />
        </div>

        {/* Email Input */}
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

        {/* Password Input */}
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
            placeholder="Create Password"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-6 w-full bg-blue-600 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex justify-center items-center"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Create Account"
          )}
        </button>

        <p className="text-center text-gray-500 text-sm mt-4">
          Already have an account? <Link href="/" className="text-blue-600 font-bold">Log In</Link>
        </p>
      </form>
    </div>
  );
}
