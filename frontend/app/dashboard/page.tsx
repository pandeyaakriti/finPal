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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold">Welcome, {user?.username || user?.email}</h1>
      <p className="mt-4">This is your protected dashboard.</p>
      <button
        onClick={() => {
          console.log('Logging out...');
          logout();
          window.location.href = '/login';
        }}
        className="mt-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
      >
        Logout
      </button>
    </div>
  );
}