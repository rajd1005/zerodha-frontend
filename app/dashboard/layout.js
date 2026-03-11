"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-semibold">Loading App...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative pb-16">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto w-full">
        {children}
      </div>
      
      {/* Mobile App Navigation */}
      <BottomNav />
    </div>
  );
}
