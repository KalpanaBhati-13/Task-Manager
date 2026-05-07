import Link from "next/link"

const statusColors = {
  "todo": "bg-gray-100 text-gray-600",
  "in-progress": "bg-yellow-100 text-yellow-700",
  "done": "bg-green-100 text-green-700"
}

const priorityColors = {
  "low": "text-gray-400",
  "medium": "text-yellow-500",
  "high": "text-red-500"
}

export default function TaskCard({ task, onStatusChange, onDelete, currentUserId, userRole }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done"

  const canEdit = userRole === "admin" ||
    task.assignedTo?._id === currentUserId ||
    task.createdBy?._id === currentUserId

  return (
    <div className={`bg-white rounded border p-4 ${isOverdue ? "border-red-200" : "border-gray-200"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{task.title}</p>
          {task.description && (
            <p className="text-xs text-gray-500 mt-1">{task.description}</p>
          )}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
          {task.status}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3 flex-wrap">
        {task.assignedTo && (
          <span className="text-xs text-gray-500">
            → {task.assignedTo.name}
          </span>
        )}

        <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>

        {task.dueDate && (
          <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
            Due: {new Date(task.dueDate).toLocaleDateString()}
            {isOverdue && " (overdue)"}
          </span>
        )}
      </div>

      {canEdit && (
        <div className="mt-3 flex items-center gap-2">
          <select
            value={task.status}
            onChange={e => onStatusChange && onStatusChange(task._id, e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1 outline-none"
          >
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {(userRole === "admin" || task.createdBy?._id === currentUserId) && (
            <button
              onClick={() => onDelete && onDelete(task._id)}
              className="text-xs text-red-400 hover:text-red-600 ml-auto"
            >
              delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
