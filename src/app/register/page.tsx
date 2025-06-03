"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function Register() {
  const auth = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.user) {
      router.push("/dashboard");
    }
  }, [auth.user, router]);

  if (auth.user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const result = await auth.register(form.username, form.password);
    setLoading(false);
    if (result.success) {
      setSuccess("Registration successful! You can now login.");
      setForm({ username: "", password: "", confirm: "" });
    } else {
      setError(result.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] text-center">
        <div className="bg-[#112240] rounded-lg p-8 shadow-2xl backdrop-blur-sm bg-opacity-90">
          {/* Logo/Brand */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-3">Join ProjectHub</h1>
            <p className="text-gray-400 text-sm">Create your account to start managing projects</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} aria-label="Registration form" className="space-y-5">
            <div className="text-left">
              <Input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                onChange={handleChange}
                value={form.username}
                placeholder="Choose a username"
                className="bg-[#1e3a8a] border-[#2d3f63] text-white placeholder-gray-400 h-12"
                error={!!error && error.includes("username")}
              />
            </div>

            <div className="text-left">
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                onChange={handleChange}
                value={form.password}
                placeholder="Create a password"
                className="bg-[#1e3a8a] border-[#2d3f63] text-white placeholder-gray-400 h-12"
                error={!!error && error.includes("password")}
              />
            </div>

            <div className="text-left">
              <Input
                id="confirm"
                name="confirm"
                type="password"
                required
                autoComplete="new-password"
                onChange={handleChange}
                value={form.confirm}
                placeholder="Confirm your password"
                className="bg-[#1e3a8a] border-[#2d3f63] text-white placeholder-gray-400 h-12"
                error={!!error && error.includes("password")}
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-900/20 border border-green-500/50 rounded px-4 py-3">
                <p className="text-sm text-green-400">{success}</p>
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
                  <span className="ml-2">Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="text-[#64ffda] hover:text-[#64ffda]/80 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
