"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import TaskCard from "@/components/TaskCard"
import Link from "next/link"

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [meRes, tasksRes, projRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/tasks"),
        fetch("/api/projects")
      ])

      const meData = await meRes.json()
      const tasksData = await tasksRes.json()
      const projData = await projRes.json()

      if(meData.user) setUser(meData.user)
      if(tasksData.tasks) setTasks(tasksData.tasks)
      if(projData.projects) setProjects(projData.projects)
    } catch(e) {
      console.log("dashboard load error:", e)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(taskId, newStatus) {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t))
    } catch(e) {
      console.log("status update err")
    }
  }

  async function deleteTask(taskId) {
    if(!confirm("delete this task?")) return
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
    setTasks(prev => prev.filter(t => t._id !== taskId))
  }

  // calc some stats
  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === "done").length
  const inProgressTasks = tasks.filter(t => t.status === "in-progress").length
  const overdueTasks = tasks.filter(t => {
    return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
  }).length

  const myTasks = tasks.filter(t => t.assignedTo?._id === user?._id)

  if(loading) {
    return (
      <div>
        <Navbar />
        <div className="p-8 text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Hey, {user?.name} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's going on</p>
        </div>

        {/* stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-800">{projects.length}</p>
            <p className="text-xs text-gray-500 mt-1">Projects</p>
          </div>
          <div className="bg-white rounded border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-800">{totalTasks}</p>
            <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
          </div>
          <div className="bg-white rounded border border-gray-200 p-4">
            <p className="text-2xl font-bold text-yellow-600">{inProgressTasks}</p>
            <p className="text-xs text-gray-500 mt-1">In Progress</p>
          </div>
          <div className="bg-white rounded border border-gray-200 p-4">
            <p className="text-2xl font-bold text-red-500">{overdueTasks}</p>
            <p className="text-xs text-gray-500 mt-1">Overdue</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* my tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700">My Tasks</h2>
              <Link href="/projects" className="text-xs text-blue-500 hover:underline">
                view all
              </Link>
            </div>

            {myTasks.length === 0 ? (
              <p className="text-sm text-gray-400">No tasks assigned to you yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {myTasks.slice(0, 5).map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    currentUserId={user?._id}
                    userRole={user?.role}
                    onStatusChange={updateStatus}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            )}
          </div>

          {/* recent tasks */}
          <div>
            <h2 className="font-semibold text-gray-700 mb-4">Recent Activity</h2>

            {tasks.length === 0 ? (
              <p className="text-sm text-gray-400">No tasks yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {tasks.slice(0, 5).map(task => (
                  <div key={task._id} className="bg-white border border-gray-200 rounded p-3">
                    <p className="text-sm text-gray-700">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {task.project?.name} • {task.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
