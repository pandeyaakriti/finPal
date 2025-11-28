// app/login/page.tsx
'use client';
import React from "react";
import { useRouter } from "next/navigation";
import GoogleButton from "@/components/GoogleButton";

import { saveToken } from "@/utils/auth";

export default function Login() {
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const f = e.target as HTMLFormElement;
    const form = new FormData(f);
    const payload = { email: form.get('email'), password: form.get('password') };
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      saveToken(data.token);
      router.push('/dashboard');
    } else {
      alert(data.message || 'Login failed');
    }
  };

  const handleGoogleToken = async (id_token: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      saveToken(data.token);
      router.push('/dashboard');
    } else alert(data.message || 'Google sign-in failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input name="email" type="email" placeholder="Email" className="w-full p-3 mb-3 rounded-lg border" required />
        <input name="password" type="password" placeholder="Password" className="w-full p-3 mb-3 rounded-lg border" required />
        <button type="submit" className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-semibold mb-3">Login</button>

        <div className="mb-3 text-center text-sm text-gray-600">or</div>
        <GoogleButton onSuccess={handleGoogleToken} />

        <div className="mt-4 text-center text-sm">
          Dont have an account? <a href="/signup" className="text-emerald-600">Sign up</a>
        </div>
      </form>
    </div>
  );
}
