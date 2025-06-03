"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../auth-context";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  role: string;
}

export default function Admin() {
  const auth = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "user" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.user || auth.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchUsers();
  }, [auth.user, auth.role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/admin/users", {
        method: 'GET',
        credentials: 'include',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/admin/users", {
        method: "POST",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error("Failed to add user");
      setNewUser({ username: "", password: "", role: "user" });
      fetchUsers();
    } catch {
      setError("Failed to add user");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`http://localhost:5000/admin/users/${id}`, {
        method: "DELETE",
        credentials: 'include',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      if (!res.ok) throw new Error("Failed to delete user");
      fetchUsers();
    } catch {
      setError("Failed to delete user");
    }
  };

  return (
    <main className="min-h-screen p-6 space-y-6 bg-[#0a192f] text-white">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded px-4 py-3 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Add New User</h3>
        <form onSubmit={handleAddUser} className="flex flex-col gap-4 max-w-sm">
          <input
            type="text"
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            required
            minLength={3}
            maxLength={20}
            className="w-full bg-[#1e3a8a] border-[#2d3f63] text-white placeholder-gray-400 h-12 rounded-lg px-4"
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
            minLength={6}
            maxLength={50}
            className="w-full bg-[#1e3a8a] border-[#2d3f63] text-white placeholder-gray-400 h-12 rounded-lg px-4"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="w-full bg-[#1e3a8a] border-[#2d3f63] text-white placeholder-gray-400 h-12 rounded-lg px-4"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="h-12 bg-[#64ffda] hover:bg-[#64ffda]/90 text-[#0a192f] font-medium rounded-lg"
          >
            Add User
          </button>
        </form>
      </section>
      <section>
        <h3 className="text-xl font-semibold mb-2">Users</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#64ffda]"></div>
              <span className="text-[#64ffda]">Loading users...</span>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No users found.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {users.map((user) => (
              <li
                key={user.id}
                className="bg-[#112240] rounded-xl shadow-md border border-[#233554] p-6 flex justify-between items-center hover:shadow-lg transition-shadow"
              >
                <div>
                  <p className="font-semibold text-white">{user.username}</p>
                  <p className="text-sm text-gray-400">Role: {user.role}</p>
                </div>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-400 hover:text-red-300 transition-colors duration-200"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
