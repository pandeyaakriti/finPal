'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { getMe } from '@/lib/api';
import { getToken, logout } from '@/utils/auth';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedToken = useRef(false);

  useEffect(() => {
    if (hasCheckedToken.current) return;
    hasCheckedToken.current = true;

    const fetchUser = async () => {
      await new Promise((r) => setTimeout(r, 100));

      const token = getToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const res = await getMe();
        if (!res.ok) {
          logout();
          window.location.href = '/login';
          return;
        }

        const data = await res.json();
        setUser(data.user);
        setLoading(false);
      } catch (err) {
        logout();
        window.location.href = '/login';
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 dark:border-emerald-900 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-emerald-600 dark:border-t-emerald-400 mx-auto absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-300 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-linear-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

      {/* Sidebar */}
      <Sidebar />

      {/* Right Content */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4.5 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>

            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition shadow-sm"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto w-full px-6 py-8">
          <div className="bg-linear-to-r from-[#299c46] to-[#6ae088] rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {(user?.username || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-3xl font-bold">
                  Welcome back, {user?.username || user?.email?.split('@')[0]}!
                </h2>
                <p className="text-emerald-100 text-sm">{user?.email}</p>
              </div>
            </div>
            <p className="text-emerald-50 text-lg">
              You’re now accessing your protected dashboard.
            </p>
          </div>
        </main>

      </div>
    </div>
  );
}
