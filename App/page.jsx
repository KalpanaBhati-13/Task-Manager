"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("users")
  const [updatingRole, setUpdatingRole] = useState(null)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    try {
      const [meRes, usersRes, projRes, tasksRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/users"),
        fetch("/api/projects"),
        fetch("/api/tasks")
      ])

      const meData = await meRes.json()

      if(!meData.user || meData.user.role !== "admin") {
        router.push("/dashboard")
        return
      }

      setUser(meData.user)

      const usersData = await usersRes.json()
      const projData = await projRes.json()
      const tasksData = await tasksRes.json()

      if(usersData.users) setUsers(usersData.users)
      if(projData.projects) setProjects(projData.projects)
      if(tasksData.tasks) setTasks(tasksData.tasks)
    } catch(e) {
      console.log("admin load err:", e)
    } finally {
      setLoading(false)
    }
  }

  async function changeRole(userId, newRole) {
    setUpdatingRole(userId)
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole })
      })
      const data = await res.json()
      if(data.user) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: data.user.role } : u))
      }
    } catch(e) {
      console.log("role change error")
    } finally {
      setUpdatingRole(null)
    }
  }

  async function deleteProject(projectId) {
    if(!confirm("delete this project and all its tasks?")) return
    await fetch(`/api/projects/${projectId}`, { method: "DELETE" })
    setProjects(prev => prev.filter(p => p._id !== projectId))
    setTasks(prev => prev.filter(t => t.project?._id !== projectId))
  }

  async function deleteTask(taskId) {
    if(!confirm("delete this task?")) return
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
    setTasks(prev => prev.filter(t => t._id !== taskId))
  }

  if(loading) {
    return (
      <div>
        <Navbar />
        <div className="p-8 text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done")

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">

        <h1 className="text-xl font-bold text-gray-800 mb-2">Admin Panel</h1>
        <p className="text-sm text-gray-500 mb-6">Manage users, projects, and tasks</p>

        {/* summary row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded p-4">
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-xs text-gray-500">Total Users</p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-4">
            <p className="text-2xl font-bold">{projects.length}</p>
            <p className="text-xs text-gray-500">Projects</p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-4">
            <p className="text-2xl font-bold">{tasks.length}</p>
            <p className="text-xs text-gray-500">Tasks</p>
          </div>
          <div className="bg-white border border-gray-200 rounded p-4">
            <p className="text-2xl font-bold text-red-500">{overdue.length}</p>
            <p className="text-xs text-gray-500">Overdue</p>
          </div>
        </div>

        {/* tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {["users", "projects", "tasks"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm capitalize ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* users tab */}
        {activeTab === "users" && (
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Joined</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u._id} className={idx % 2 === 0 ? "" : "bg-gray-50"}>
                    <td className="px-4 py-3 text-gray-800">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {u._id !== user._id && (
                        <select
                          value={u.role}
                          disabled={updatingRole === u._id}
                          onChange={e => changeRole(u._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 outline-none"
                        >
                          <option value="member">member</option>
                          <option value="admin">admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* projects tab */}
        {activeTab === "projects" && (
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Owner</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Members</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, idx) => (
                  <tr key={p._id} className={idx % 2 === 0 ? "" : "bg-gray-50"}>
                    <td className="px-4 py-3 text-gray-800 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500">{p.owner?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.status === "active" ? "bg-green-100 text-green-700" :
                        p.status === "completed" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.members?.length || 0}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteProject(p._id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* tasks tab */}
        {activeTab === "tasks" && (
          <div className="bg-white border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Project</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Assigned To</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Due</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t, idx) => {
                  var isOd = t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
                  return (
                    <tr key={t._id} className={idx % 2 === 0 ? "" : "bg-gray-50"}>
                      <td className="px-4 py-3 text-gray-800">{t.title}</td>
                      <td className="px-4 py-3 text-gray-500">{t.project?.name}</td>
                      <td className="px-4 py-3 text-gray-500">{t.assignedTo?.name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          t.status === "done" ? "bg-green-100 text-green-700" :
                          t.status === "in-progress" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-xs ${isOd ? "text-red-500 font-medium" : "text-gray-400"}`}>
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                        {isOd && " ⚠"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteTask(t._id)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}
