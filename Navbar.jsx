"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if(data.user) setUser(data.user)
      })
      .catch(e => console.log("navbar fetch err:", e))
  }, [])

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="font-bold text-blue-600 text-lg">
          TaskFlow
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
          Dashboard
        </Link>
        <Link href="/projects" className="text-sm text-gray-600 hover:text-gray-900">
          Projects
        </Link>
        {user?.role === "admin" && (
          <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
            Admin
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-600">
            {user.name}
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
              user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
            }`}>
              {user.role}
            </span>
          </span>
        )}
        <button
          onClick={logout}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
