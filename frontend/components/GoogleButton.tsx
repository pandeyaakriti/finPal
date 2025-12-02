// components/GoogleButton.tsx
"use client";

import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleButtonProps {
  onSuccess: (token: string) => void;
}

export default function GoogleButton({ onSuccess }: GoogleButtonProps) {
  const buttonDivRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Make sure Google Identity Services script is loaded
    if (!window.google) return;

    // Initialize the Google Identity Services client
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: (response: { credential: string }) => {
        // Prevent multiple calls
        if (isProcessingRef.current) {
          console.log('Already processing Google login, ignoring...');
          return;
        }
        
        isProcessingRef.current = true;
        console.log('Google callback triggered');
        onSuccess(response.credential);
      },
    });

    // Render the classic Google button inside the div
    if (buttonDivRef.current) {
      window.google.accounts.id.renderButton(buttonDivRef.current, {
        theme: "outline",
        size: "large",
        width: "350",
        text: "signin_with",
      });
    }
    
    // Cleanup
    return () => {
      isProcessingRef.current = false;
    };
  }, [onSuccess]);

  return <div ref={buttonDivRef}></div>;
}