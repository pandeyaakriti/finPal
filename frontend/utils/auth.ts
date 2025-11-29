// utils/auth.ts
export const saveToken = (token: string) => {
  if (typeof window !== "undefined") {
    // Save to both localStorage and cookies for reliability
    localStorage.setItem("token", token);
    
    // Set cookie that expires in 7 days
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    // Try to get from localStorage first
    const localToken = localStorage.getItem("token");
    if (localToken) return localToken;
    
    // Fallback to cookie
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
  }
  return null;
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    // Remove cookie by setting expired date
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};