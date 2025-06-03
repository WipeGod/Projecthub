"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function Login() {
  const auth = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.user) {
      router.push("/dashboard");
    }
  }, [auth.user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await auth.login(form.username, form.password);
    setLoading(false);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.message || "Login failed");
    }
  };

  if (auth.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] text-center">
        <div className="bg-[#112240] rounded-lg p-8 shadow-2xl backdrop-blur-sm bg-opacity-90">
          {/* Logo/Brand */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-3">ProjectHub</h1>
            <p className="text-gray-400 text-sm">Manage projects efficiently</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} aria-label="Login form" className="space-y-5">
            <div className="text-left">
              <Input
                id="username"
                name="username"
                type="text"
                required
                onChange={handleChange}
                value={form.username}
                autoComplete="username"
                placeholder="Username"
                className="bg-[#1e3a8a] border-[#2d3f63] text-white placeholder-gray-400 h-12"
              />
            </div>

            <div className="text-left">
              <Input
                id="password"
                name="password"
                type="password"
                required
                onChange={handleChange}
                value={form.password}
                autoComplete="current-password"
                placeholder="Password"
                className="bg-[#1e3a8a] border-[#2d3f63] text-white placeholder-gray-400 h-12"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#64ffda] hover:bg-[#64ffda]/90 text-[#0a192f] font-medium h-12 text-base"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0a192f]"></div>
                  <span className="ml-2">Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6">
            <p className="text-gray-400 text-sm">
              New to ProjectHub?{" "}
              <Link 
                href="/register" 
                className="text-[#64ffda] hover:text-[#64ffda]/80 transition-colors duration-200"
              >
                Sign up now
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-[#2d3f63]">
            <p className="text-xs text-gray-500 mb-2">Demo Account</p>
            <p className="text-xs text-gray-400">
              admin / adminpass
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
