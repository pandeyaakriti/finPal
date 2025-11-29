// app/login/page.tsx
'use client';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import GoogleButton from '@/components/GoogleButton';
import { saveToken, getToken } from '@/utils/auth';
import { postJSON } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login...');
      const res = await postJSON('/auth/login', { email, password });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Login failed:', errorData);
        setError(errorData.detail || 'Login failed');
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      console.log('Login response:', data);

      if (data.token) {
        console.log('Token received, saving...');
        saveToken(data.token);
        
        // Verify token was saved
        const savedToken = getToken();
        console.log('Token saved successfully?', !!savedToken);
        console.log('Saved token:', savedToken?.substring(0, 20) + '...');
        console.log('Navigating to dashboard...');
        
        // Force a hard reload
        window.location.replace('/dashboard');
        
        return; // Prevent setting loading to false
      } else {
        console.error('No token in response:', data);
        setError(data.detail || 'Login failed - no token received');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login error: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setIsLoading(false);
    }
  };

  const handleGoogle = useCallback(async (token: string) => {
    // Prevent multiple simultaneous calls
    if (isLoading) {
      console.log('Already processing, ignoring duplicate call');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting Google login...');
      const res = await postJSON('/auth/google-login', { token });
      
      console.log('Google response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Google login failed:', errorData);
        setError(errorData.detail || 'Google login failed');
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      console.log('Google login response:', data);

      if (data.token) {
        console.log('Token received, saving...');
        saveToken(data.token);
        
        // Verify token was saved
        const savedToken = getToken();
        console.log('Token saved successfully?', !!savedToken);
        console.log('Saved token:', savedToken?.substring(0, 20) + '...');
        console.log('Navigating to dashboard...');
        
        // Force a hard reload
        window.location.replace('/dashboard');
        
        return; // Prevent setting loading to false
      } else {
        console.error('No token in Google response:', data);
        setError(data.detail || 'Google login failed - no token received');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google login error: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setIsLoading(false);
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <input 
          name="email" 
          type="email" 
          placeholder="Email" 
          className="w-full p-3 mb-3 rounded border" 
          required 
          disabled={isLoading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Password" 
          className="w-full p-3 mb-3 rounded border" 
          required 
          disabled={isLoading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button 
          onClick={handleSubmit}
          className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-semibold mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <div className="mb-3 text-center text-gray-500">or</div>
        <GoogleButton onSuccess={handleGoogle} />
      </div>
    </div>
  );
}