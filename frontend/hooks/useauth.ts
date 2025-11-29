// hooks/useAuth.ts
'use client';
import { useEffect, useState } from 'react';
import { getMe } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await getMe();
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      setUser(data.user);
      setLoading(false);
    })();
  }, []);

  return { user, loading };
}
