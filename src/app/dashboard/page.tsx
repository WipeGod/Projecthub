"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../auth-context";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/Button";

interface Stats {
  totalProjects: number;
  totalTasks: number;
  totalUsers: number;
  completedTasks: number;
}

export default function Dashboard() {
  const auth = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.user) {
      router.push("/login");
      return;
    }
    fetchStats();
  }, [auth.user]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/dashboard/stats", {
        method: 'GET',
        credentials: 'include',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { 
      name: "Total Projects", 
      value: stats.totalProjects,
      color: "bg-[#64ffda]",
      textColor: "text-[#64ffda]"
    },
    { 
      name: "Total Tasks", 
      value: stats.totalTasks,
      color: "bg-[#5eead4]",
      textColor: "text-[#5eead4]"
    },
    { 
      name: "Completed Tasks", 
      value: stats.completedTasks,
      color: "bg-[#4fd1c5]",
      textColor: "text-[#4fd1c5]"
    },
    { 
      name: "Team Members", 
      value: stats.totalUsers,
      color: "bg-[#38b2ac]",
      textColor: "text-[#38b2ac]"
    },
  ] : [];

  if (!auth.user) {
    return null;
  }

  return (
    <div className="min-h-screen p-6 space-y-6 bg-[#0a192f] text-white">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400 text-lg">Welcome back, {auth.user.username}!</p>
        <div className="flex items-center justify-center mt-4 space-x-4">
          <div className="text-sm">
            <span className="text-gray-500">Role: </span>
            <span className="font-medium capitalize">{auth.role}</span>
          </div>
          <Button 
            variant="outline" 
            onClick={auth.logout}
            className="border-[#64ffda] text-[#64ffda] hover:bg-[#64ffda]/10"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded px-4 py-3 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#64ffda]"></div>
            <span className="text-[#64ffda]">Loading dashboard data...</span>
          </div>
        </div>
      ) : stats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-[#112240] rounded-xl shadow-md border border-[#233554] p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-lg w-12 h-12`}></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                    <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-[#112240] rounded-xl shadow-md border border-[#233554] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-12 bg-[#64ffda] hover:bg-[#64ffda]/90 text-[#0a192f] font-medium"
                onClick={() => router.push('/projects')}
              >
                View Projects
              </Button>
              <Button 
                variant="outline" 
                className="h-12 border-[#64ffda] text-[#64ffda] hover:bg-[#64ffda]/10"
                onClick={() => router.push('/tasks')}
              >
                View Tasks
              </Button>
              {auth.role === 'admin' && (
                <Button 
                  variant="outline" 
                  className="h-12 border-[#64ffda] text-[#64ffda] hover:bg-[#64ffda]/10"
                  onClick={() => router.push('/admin')}
                >
                  Admin Panel
                </Button>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#112240] rounded-xl shadow-md border border-[#233554]">
            <div className="px-6 py-4 border-b border-[#233554]">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-[#0a192f] rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">
                      Welcome to ProjectHub! Start by exploring your projects and tasks.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#233554] rounded-xl mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-white mb-2">No Data Available</h3>
          <p className="text-gray-400">Dashboard data could not be loaded at this time.</p>
          <Button 
            variant="outline" 
            className="mt-4 border-[#64ffda] text-[#64ffda] hover:bg-[#64ffda]/10"
            onClick={fetchStats}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
