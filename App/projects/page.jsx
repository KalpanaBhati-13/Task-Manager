"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import TaskCard from "@/components/TaskCard"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [allUsers, setAllUsers] = useState([])

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    dueDate: ""
  })
  const [memberEmail, setMemberEmail] = useState("")
  const [taskErr, setTaskErr] = useState("")
  const [memberErr, setMemberErr] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAll()
  }, [projectId])

  async function loadAll() {
    try {
      const [projRes, meRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch("/api/auth/me")
      ])

      const projData = await projRes.json()
      const meData = await meRes.json()

      if(projData.project) setProject(projData.project)
      if(projData.tasks) setTasks(projData.tasks)
      if(meData.user) setUser(meData.user)

      // if admin get all users for assignment
      if(meData.user?.role === "admin") {
        const usersRes = await fetch("/api/users")
        const usersData = await usersRes.json()
        if(usersData.users) setAllUsers(usersData.users)
      }
    } catch(e) {
      console.log("project detail load err:", e)
    } finally {
      setLoading(false)
    }
  }

  async function createTask(e) {
    e.preventDefault()
    setTaskErr("")
    setSubmitting(true)

    try {
      const body = {
        title: taskForm.title,
        description: taskForm.description,
        project: projectId,
        assignedTo: taskForm.assignedTo || null,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || null
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      var data = await res.json()

      if(!res.ok) {
        setTaskErr(data.error || "failed")
        setSubmitting(false)
        return
      }

      setTasks(prev => [data.task, ...prev])
      setTaskForm({ title: "", description: "", assignedTo: "", priority: "medium", dueDate: "" })
      setShowTaskForm(false)
    } catch(e) {
      setTaskErr("something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  async function updateTaskStatus(taskId, status) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    })
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t))
  }

  async function removeTask(taskId) {
    if(!confirm("delete task?")) return
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
    setTasks(prev => prev.filter(t => t._id !== taskId))
  }

  async function addMember(e) {
    e.preventDefault()
    setMemberErr("")

    // find user by email from allUsers
    const targetUser = allUsers.find(u => u.email === memberEmail.toLowerCase())
    if(!targetUser) {
      setMemberErr("user not found")
      return
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUser._id })
      })

      const data = await res.json()
      if(!res.ok) {
        setMemberErr(data.error)
        return
      }

      setProject(prev => ({ ...prev, members: data.members }))
      setMemberEmail("")
      setShowMemberForm(false)
    } catch(e) {
      setMemberErr("error adding member")
    }
  }

  async function removeMember(userId) {
    if(!confirm("remove this member?")) return

    await fetch(`/api/projects/${projectId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    })

    setProject(prev => ({
      ...prev,
      members: prev.members.filter(m => m._id !== userId)
    }))
  }

  const isOwner = user && project && project.owner?._id === user._id
  const canManage = isOwner || user?.role === "admin"

  // group tasks by status
  const todoTasks = tasks.filter(t => t.status === "todo")
  const inProgressTasks = tasks.filter(t => t.status === "in-progress")
  const doneTasks = tasks.filter(t => t.status === "done")

  if(loading) {
    return (
      <div>
        <Navbar />
        <div className="p-8 text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if(!project) {
    return (
      <div>
        <Navbar />
        <div className="p-8 text-gray-500">Project not found</div>
      </div>
    )
  }

  const members = project.members || []
  const memberOptions = members

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-gray-500 mt-1">{project.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Owner: {project.owner?.name} •
                <span className={`ml-1 ${
                  project.status === "active" ? "text-green-600" :
                  project.status === "completed" ? "text-blue-600" : "text-yellow-600"
                }`}>
                  {project.status}
                </span>
              </p>
            </div>

            {canManage && (
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
              >
                + Add Task
              </button>
            )}
          </div>
        </div>

        {/* add task form */}
        {showTaskForm && (
          <div className="bg-white border border-gray-200 rounded p-5 mb-6">
            <h3 className="font-medium text-gray-700 mb-4">New Task</h3>
            {taskErr && <p className="text-red-500 text-sm mb-3">{taskErr}</p>}

            <form onSubmit={createTask}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Task title"
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-400"
                  required
                />

                <select
                  value={taskForm.assignedTo}
                  onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                >
                  <option value="">Unassigned</option>
                  {memberOptions.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <textarea
                  placeholder="Description (optional)"
                  value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none resize-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <select
                  value={taskForm.priority}
                  onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>

                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Task"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* task columns */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* todo */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                  Todo
                  <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full">{todoTasks.length}</span>
                </h3>
                <div className="flex flex-col gap-2">
                  {todoTasks.map(t => (
                    <TaskCard
                      key={t._id}
                      task={t}
                      currentUserId={user?._id}
                      userRole={user?.role}
                      onStatusChange={updateTaskStatus}
                      onDelete={removeTask}
                    />
                  ))}
                  {todoTasks.length === 0 && <p className="text-xs text-gray-400">empty</p>}
                </div>
              </div>

              {/* in progress */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                  In Progress
                  <span className="bg-yellow-100 text-yellow-600 text-xs px-1.5 py-0.5 rounded-full">{inProgressTasks.length}</span>
                </h3>
                <div className="flex flex-col gap-2">
                  {inProgressTasks.map(t => (
                    <TaskCard
                      key={t._id}
                      task={t}
                      currentUserId={user?._id}
                      userRole={user?.role}
                      onStatusChange={updateTaskStatus}
                      onDelete={removeTask}
                    />
                  ))}
                  {inProgressTasks.length === 0 && <p className="text-xs text-gray-400">empty</p>}
                </div>
              </div>

              {/* done */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                  Done
                  <span className="bg-green-100 text-green-600 text-xs px-1.5 py-0.5 rounded-full">{doneTasks.length}</span>
                </h3>
                <div className="flex flex-col gap-2">
                  {doneTasks.map(t => (
                    <TaskCard
                      key={t._id}
                      task={t}
                      currentUserId={user?._id}
                      userRole={user?.role}
                      onStatusChange={updateTaskStatus}
                      onDelete={removeTask}
                    />
                  ))}
                  {doneTasks.length === 0 && <p className="text-xs text-gray-400">empty</p>}
                </div>
              </div>

            </div>
          </div>

          {/* members sidebar */}
          <div>
            <div className="bg-white border border-gray-200 rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Members</h3>
                {canManage && (
                  <button
                    onClick={() => setShowMemberForm(!showMemberForm)}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    + add
                  </button>
                )}
              </div>

              {showMemberForm && (
                <form onSubmit={addMember} className="mb-3">
                  {memberErr && <p className="text-red-500 text-xs mb-2">{memberErr}</p>}
                  <input
                    type="email"
                    placeholder="user email"
                    value={memberEmail}
                    onChange={e => setMemberEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs outline-none mb-2"
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-700"
                  >
                    Add
                  </button>
                </form>
              )}

              <div className="flex flex-col gap-2">
                {members.map(m => (
                  <div key={m._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-700">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.email}</p>
                    </div>
                    {canManage && m._id !== project.owner?._id && (
                      <button
                        onClick={() => removeMember(m._id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
