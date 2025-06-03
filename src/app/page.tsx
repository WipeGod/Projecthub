"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

export default function Home() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading) {
      if (auth.user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [auth.user, auth.loading, router]);

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">ProjectHub</h1>
            <p className="text-slate-600">Loading your workspace...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
