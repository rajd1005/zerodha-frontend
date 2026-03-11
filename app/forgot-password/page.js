"use client";

import { useState } from 'react';
import axios from 'axios';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/auth/forgotpassword`, { email });
      setMessage(response.data.message || 'Reset link sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen px-6 pt-12 pb-10">
      <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-12">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Login</span>
      </Link>

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
        <p className="text-gray-500 mt-2 text-sm">Enter your email and we will send you a reset link.</p>
      </div>

      {message ? (
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <p className="text-green-600 font-medium">{message}</p>
          <Link href="/" className="mt-8 text-blue-600 font-bold underline">Return to Login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100">{error}</div>}
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="Email Address"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition flex justify-center items-center gap-2"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Send className="w-4 h-4"/> Send Reset Link</>}
          </button>
        </form>
      )}
    </div>
  );
}
