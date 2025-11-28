"use client";
import React, { useEffect } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleButtonProps {
  onSuccess: (token: string) => void;
}

export default function GoogleButton({ onSuccess }: GoogleButtonProps) {
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: (response: { credential: string }) => {
          onSuccess(response.credential);
        },
      });
    }
  }, [onSuccess]);

  const handleClick = () => {
    if (window.google) window.google.accounts.id.prompt();
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all bg-white"
    >
      <img
        src="/google-logo.png"
        alt="Google"
        className="w-5 h-5 mr-3"
      />
      <span className="text-gray-700 font-medium">Continue with Google</span>
    </button>
  );
}
