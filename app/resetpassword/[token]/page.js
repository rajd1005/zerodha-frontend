"use client";

import { useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { Lock, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    setError('');

    try {
      await axios.put(`${API_URL}/auth/resetpassword/${token}`, { password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Link expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen px-6 pt-20">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Set New Password</h1>
        <p className="text-gray-500 mt-2 text-sm">Please enter your new secure password.</p>
      </div>

      {success ? (
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-green-600 font-bold text-lg">Password Updated!</p>
          <Link href="/" className="mt-8 bg-gray-900 text-white py-4 px-8 rounded-2xl inline-flex items-center gap-2 font-bold active:scale-95 transition">
            Go to Login <ArrowRight className="w-5 h-5"/>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100">{error}</div>}
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="New Password"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Confirm New Password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition flex justify-center items-center"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}
