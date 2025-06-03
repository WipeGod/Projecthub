"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../auth-context";

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname();
  const { user, role } = useAuth();

  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <aside className={`w-64 h-screen bg-[#0f172a] text-white fixed left-0 top-0 shadow-lg z-50 transition-transform duration-300 transform ${
      open ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold">ProjectHub</h2>
        <p className="text-sm text-gray-400">Welcome, {user.username}</p>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className={`block p-2 rounded hover:bg-gray-800 ${
                isActive("/dashboard") ? "bg-gray-800" : ""
              }`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/projects"
              className={`block p-2 rounded hover:bg-gray-800 ${
                isActive("/projects") ? "bg-gray-800" : ""
              }`}
            >
              Projects
            </Link>
          </li>
          <li>
            <Link
              href="/tasks"
              className={`block p-2 rounded hover:bg-gray-800 ${
                isActive("/tasks") ? "bg-gray-800" : ""
              }`}
            >
              Tasks
            </Link>
          </li>
          {role === "admin" && (
            <li>
              <Link
                href="/admin"
                className={`block p-2 rounded hover:bg-gray-800 ${
                  isActive("/admin") ? "bg-gray-800" : ""
                }`}
              >
                Admin Panel
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
