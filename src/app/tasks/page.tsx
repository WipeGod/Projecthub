"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../auth-context";
import { useRouter } from "next/navigation";

interface Task {
  id: number;
  title: string;
  description: string;
  projectId: number;
}

export default function Tasks() {
  const auth = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", projectId: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.user) {
      router.push("/login");
      return;
    }
    fetchTasks();
  }, [auth.user]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/tasks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data.tasks);
    } catch (err) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(newTask),
      });
      if (!res.ok) throw new Error("Failed to add task");
      setNewTask({ title: "", description: "", projectId: 0 });
      fetchTasks();
    } catch {
      setError("Failed to add task");
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`http://localhost:5000/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      if (!res.ok) throw new Error("Failed to delete task");
      fetchTasks();
    } catch {
      setError("Failed to delete task");
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Tasks</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Add New Task</h3>
        <form onSubmit={handleAddTask} className="flex flex-col gap-2 max-w-xs mx-auto text-center">
          <input
            type="text"
            placeholder="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
            className="border p-2 rounded max-w-xs mx-auto"
          />
          <textarea
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="border p-2 rounded max-w-xs mx-auto"
          />
          <input
            type="number"
            placeholder="Project ID"
            value={newTask.projectId || ""}
            onChange={(e) => setNewTask({ ...newTask, projectId: Number(e.target.value) })}
            required
            className="border p-2 rounded max-w-xs mx-auto"
          />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 max-w-xs mx-auto">
            Add Task
          </button>
        </form>
      </section>
      <section>
        <h3 className="text-xl font-semibold mb-2">Tasks List</h3>
        {loading ? (
          <p>Loading tasks...</p>
        ) : (
          <ul className="space-y-4 max-w-2xl mx-auto">
            {tasks.map((task) => (
              <li key={task.id} className="bg-[#112240] rounded-xl shadow-md border border-[#233554] p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <h4 className="text-lg font-semibold text-white mb-2">{task.title}</h4>
                  <p className="text-gray-400 mb-4">{task.description}</p>
                  <p className="text-sm text-gray-500 mb-4">Project ID: {task.projectId}</p>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
