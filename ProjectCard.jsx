import Link from "next/link"

const statusBadge = {
  "active": "bg-green-100 text-green-700",
  "completed": "bg-blue-100 text-blue-700",
  "on-hold": "bg-yellow-100 text-yellow-700"
}

export default function ProjectCard({ project, taskCount }) {
  return (
    <Link href={`/projects/${project._id}`}>
      <div className="bg-white rounded border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800 text-sm">{project.name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[project.status]}`}>
            {project.status}
          </span>
        </div>

        {project.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{project.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{project.members?.length || 0} members</span>
          {taskCount !== undefined && <span>{taskCount} tasks</span>}
          <span>by {project.owner?.name}</span>
        </div>
      </div>
    </Link>
  )
}
