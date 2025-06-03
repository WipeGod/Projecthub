"use client";

import { ReactNode, useState } from "react";
import { useAuth } from "../auth-context";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

interface LayoutWrapperProps {
  children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Only hide sidebar on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return <main className="w-full">{children}</main>;
  }

  // Show sidebar and toggle button on all other pages including dashboard

  return (
    <div className="flex">
      {user && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-[9999] p-4 bg-[#64ffda] text-[#0a192f] rounded-xl hover:bg-[#5eead4] transition-colors duration-200 flex flex-col justify-center items-center space-y-2 shadow-lg"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <>
            <span className={`block w-8 h-0.75 bg-current rounded transition-transform duration-300 ${sidebarOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
            <span className={`block w-8 h-0.75 bg-current rounded transition-opacity duration-300 ${sidebarOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-8 h-0.75 bg-current rounded transition-transform duration-300 ${sidebarOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
          </>
        </button>
      )}
      <Sidebar open={sidebarOpen} />
      <main 
        className={`flex-grow transition-all duration-300 ${
          sidebarOpen && user ? "ml-64 px-8" : "px-4"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
