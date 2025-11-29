// app/dashboard/page.tsx
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '@/lib/api';
import { getToken, logout } from '@/utils/auth';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedToken = useRef(false);

  useEffect(() => {
    // Prevent running multiple times
    if (hasCheckedToken.current) return;
    hasCheckedToken.current = true;

    const fetchUser = async () => {
      console.log('Dashboard: Starting user fetch...');
      
      // Wait a bit for localStorage to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const token = getToken();
      console.log('Dashboard: Token exists?', !!token);
      
      if (!token) {
        console.log('Dashboard: No token found after delay, redirecting to login');
        await new Promise(resolve => setTimeout(resolve, 100));
        window.location.href = '/login';
        return;
      }

      console.log('Dashboard: Token found:', token.substring(0, 20) + '...');

      try {
        console.log('Dashboard: Calling getMe API...');
        const res = await getMe();
        console.log('Dashboard: API response status:', res.status);
        
        if (!res.ok) {
          console.error('Dashboard: API response not OK, logging out');
          logout();
          window.location.href = '/login';
          return;
        }
        
        const data = await res.json();
        console.log('Dashboard: User data received:', data);
        setUser(data.user);
        setLoading(false);
      } catch (err) {
        console.error('Dashboard: Error fetching user:', err);
        logout();
        window.location.href = '/login';
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 dark:border-emerald-900 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-emerald-600 dark:border-t-emerald-400 mx-auto absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-300 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          </div>
          <button
            onClick={() => {
              console.log('Logging out...');
              logout();
              window.location.href = '/login';
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                {(user?.username || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">
                  Welcome back, {user?.username || user?.email?.split('@')[0] || 'User'}!
                </h2>
                <p className="text-emerald-100 text-sm">{user?.email}</p>
              </div>
            </div>
            <p className="text-emerald-50 text-lg">
              Youre now accessing your protected dashboard
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}