"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Task {
  id: number;
  title: string;
  status: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  tasks: Task[];
}

interface ProjectDetailProps {
  params: {
    id: string;
  };
}

export default function ProjectDetail({ params }: ProjectDetailProps) {
  const auth = useAuth();
  const router = useRouter();
  const projectId = params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [newTask, setNewTask] = useState({ title: "" });
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    if (!auth.user) {
      router.push("/login");
      return;
    }
    fetchProject();
  }, [auth.user, projectId]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/projects/${projectId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      if (!res.ok) throw new Error("Failed to fetch project");
      const data = await res.json();
      setProject(data);
      setEditForm({ name: data.name, description: data.description });
    } catch (err) {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/projects/${projectId}`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update project");
      const data = await res.json();
      setProject(data);
      setEditing(false);
    } catch {
      setError("Failed to update project");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/projects/${projectId}/tasks`, {
        method: "POST",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(newTask),
      });
      if (!res.ok) throw new Error("Failed to add task");
      setNewTask({ title: "" });
      setAddingTask(false);
      fetchProject();
    } catch {
      setError("Failed to add task");
    }
  };

  if (!auth.user) {
    return null;
  }

  return (
    <main className="min-h-screen p-6 space-y-6 bg-[#0a192f] text-white">
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/projects" 
          className="text-[#64ffda] hover:text-[#64ffda]/80 transition-colors duration-200"
        >
          ← Back to Projects
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded px-4 py-3 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#64ffda]"></div>
            <span className="text-[#64ffda]">Loading project...</span>
          </div>
        </div>
      ) : project ? (
        <div className="space-y-6">
          <div className="bg-[#112240] rounded-xl shadow-md border border-[#233554] p-6">
            {editing ? (
              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    minLength={3}
                    maxLength={50}
                    className="w-full bg-[#1e3a8a] border-[#2d3f63] text-white placeholder-gray-400 h-12 rounded-lg px-4"
                  />
                </div>
                <div>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    required
                    minLength={10}
                    maxLength={500}
                    className="w-full bg-[#1e3a8a] border-[#2d3f63] text-white placeholder-gray-400 h-24 rounded-lg p-4 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#64ffda] hover:bg-[#64ffda]/90 text-[#0a192f] font-medium rounded-lg"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="h-10 px-4 border border-[#64ffda] text-[#64ffda] hover:bg-[#64ffda]/10 font-medium rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{project.name}</h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-[#64ffda] hover:text-[#64ffda]/80 transition-colors duration-200"
                  >
                    Edit Project
                  </button>
                </div>
                <p className="text-gray-400">{project.description}</p>
              </div>
            )}
          </div>

          <div className="bg-[#112240] rounded-xl shadow-md border border-[#233554] p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Tasks</h3>
              <button
                onClick={() => setAddingTask(true)}
                className="text-[#64ffda] hover:text-[#64ffda]/80 transition-colors duration-200"
              >
                Add Task
              </button>
            </div>

            {addingTask && (
              <form onSubmit={handleAddTask} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ title: e.target.value })}
                    required
                    minLength={3}
                    maxLength={100}
                    className="flex-1 bg-[#1e3a8a] border-[#2d3f63] text-white placeholder-gray-400 h-10 rounded-lg px-4"
                  />
                  <button
                    type="submit"
                    className="h-10 px-4 bg-[#64ffda] hover:bg-[#64ffda]/90 text-[#0a192f] font-medium rounded-lg"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingTask(false)}
                    className="h-10 px-4 border border-[#64ffda] text-[#64ffda] hover:bg-[#64ffda]/10 font-medium rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {project.tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No tasks yet. Add your first task to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex justify-between items-center p-4 bg-[#1e3a8a] rounded-lg"
                  >
                    <span className="text-white">{task.title}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">{task.status}</span>
                      <Link
                        href={`/task/${task.id}`}
                        className="text-[#64ffda] hover:text-[#64ffda]/80 transition-colors duration-200"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#233554] rounded-xl mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-white mb-2">Project Not Found</h3>
          <p className="text-gray-400">The project you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      )}
    </main>
  );
}
