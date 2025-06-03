"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Comment {
  id: number;
  author: string;
  content: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  assignedTo: string;
  dueDate: string;
  comments: Comment[];
}

interface TaskDetailProps {
  params: {
    id: string;
  };
}

export default function TaskDetail({ params }: TaskDetailProps) {
  const auth = useAuth();
  const router = useRouter();
  const taskId = params.id;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.user) {
      router.push("/login");
      return;
    }
    fetchTask();
  }, [auth.user, taskId]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      if (!res.ok) throw new Error("Failed to fetch task");
      const data = await res.json();
      setTask(data);
    } catch (err) {
      setError("Failed to load task");
    } finally {
      setLoading(false);
    }
  };

  if (!auth.user) {
    return null;
  }

  return (
    <main className="min-h-screen p-6 space-y-6 bg-[#0a192f] text-white">
      <div className="mb-6">
        <Link 
          href="/projects" 
          className="text-[#64ffda] hover:text-[#64ffda]/80 transition-colors duration-200"
        >
          ← Back to Projects
        </Link>
      </div>

      <div className="text-center">
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded px-4 py-3 mb-6 max-w-md mx-auto">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#64ffda]"></div>
            <span className="text-[#64ffda]">Loading task...</span>
          </div>
        </div>
      ) : task ? (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="bg-[#112240] rounded-xl shadow-md border border-[#233554] p-6">
            <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
            <p className="text-gray-400 mb-4">{task.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Status</h3>
                <p className="text-green-400">{task.status}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Assigned To</h3>
                <p>{task.assignedTo}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Due Date</h3>
                <p>{new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#112240] rounded-xl shadow-md border border-[#233554] p-6">
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            {task.comments.length === 0 ? (
              <p className="text-gray-400">No comments yet.</p>
            ) : (
              <div className="space-y-4">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-[#1e3a8a] rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">{comment.author}</p>
                    <p>{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#233554] rounded-xl mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-white mb-2">Task Not Found</h3>
          <p className="text-gray-400">The task you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      )}
    </main>
  );
}
