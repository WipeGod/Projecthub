"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  user: { username: string } | null;
  role: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  register: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  register: async () => ({ success: false })
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem("username");
      const storedRole = localStorage.getItem("role");
      if (storedUser) {
        setUser({ username: storedUser });
        setRole(storedRole);
      }
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        credentials: 'include',
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || "Login failed");
      }
      const data = await res.json();
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      setUser({ username: data.username });
      setRole(data.role);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setRole(null);
  };

  const register = async (username: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        credentials: 'include',
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.msg || "Registration failed");
      }
      
      return { success: true, message: data.msg };
    } catch (error: any) {
      console.error("Registration error:", error);
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
