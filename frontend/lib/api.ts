// lib/api.ts
import { getToken } from "@/utils/auth";

export const getMe = async () => {
  const token = getToken();
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const postJSON = async (url: string, data: any) => {
  const token = getToken();
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
};
