"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Project {
  id: number;
  name: string;
  description: string;
}

export default function Projects() {
  const auth = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.user) {
      router.push("/login");
      return;
    }
    fetchProjects();
  }, [auth.user]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/projects", {
        method: 'GET',
        credentials: 'include',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data.projects);
    } catch (err) {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/projects", {
        method: "POST",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(newProject),
      });
      if (!res.ok) throw new Error("Failed to add project");
      setNewProject({ name: "", description: "" });
      fetchProjects();
    } catch {
      setError("Failed to add project");
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`http://localhost:5000/projects/${id}`, {
        method: "DELETE",
        credentials: 'include',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      if (!res.ok) throw new Error("Failed to delete project");
      fetchProjects();
    } catch {
      setError("Failed to delete project");
    }
  };

  return (
    <main className="min-h-screen p-6 space-y-6 bg-[#0a192f] text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Projects</h2>
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded px-4 py-3 mb-6 max-w-md mx-auto">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-4 text-center">Add New Project</h3>
        <form onSubmit={handleAddProject} className="flex flex-col gap-4 max-w-xs mx-auto text-center">
          <div>
            <input
              type="text"
              placeholder="Project Name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              required
              minLength={3}
              maxLength={50}
              className="w-full max-w-xs bg-[#1e3a8a] border-[#2d3f63] text-white placeholder-gray-400 h-12 rounded-lg px-4 mx-auto"
            />
          </div>
          <div>
            <textarea
              placeholder="Description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              required
              minLength={10}
              maxLength={500}
              className="w-full max-w-xs bg-[#1e3a8a] border-[#2d3f63] text-white placeholder-gray-400 h-24 rounded-lg p-4 resize-none mx-auto"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="h-12 bg-[#64ffda] hover:bg-[#64ffda]/90 text-[#0a192f] font-medium rounded-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0a192f]"></div>
                <span className="ml-2">Creating...</span>
              </div>
            ) : (
              "Add Project"
            )}
          </button>
        </form>
      </section>
      <section>
        <h3 className="text-xl font-semibold mb-2">Projects List</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#64ffda]"></div>
              <span className="text-[#64ffda]">Loading projects...</span>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#233554] rounded-xl mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-white mb-2">No Projects Yet</h3>
            <p className="text-gray-400">Create your first project to get started.</p>
          </div>
        ) : (
          <ul className="grid gap-4">
            {projects.map((project) => (
              <li 
                key={project.id} 
                className="bg-[#112240] rounded-xl shadow-md border border-[#233554] p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">{project.name}</h4>
                    <p className="text-gray-400">{project.description}</p>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href={`/project/${project.id}`}
                      className="text-[#64ffda] hover:text-[#64ffda]/80 transition-colors duration-200"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
