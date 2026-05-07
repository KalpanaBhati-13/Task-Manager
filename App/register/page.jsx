"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "member"
  })
  const [errMsg, setErrMsg] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function submit(e) {
    e.preventDefault();
    setErrMsg("");
    
    let pass = formData.password;
    let mail = formData.email;

    if (!mail.includes('@') || !mail.includes('.')) {
      setErrMsg("Please enter a valid email address!");
      return;
    }
    
    // basic pass validation before hitting the server
    if (pass.length < 8 || !/\d/.test(pass) || !/[a-zA-Z]/.test(pass)) {
      setErrMsg("Password is too weak! Use at least 8 characters with numbers and letters.");
      return;
    }

    setLoading(true);

    try {
      let res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      let data = await res.json();

      if (!res.ok) {
        setErrMsg(data.error || "Failed to register... try again later?");
        setLoading(false);
        return;
      }

      // auto login right after register
      let loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      if (loginRes.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.log("Error during registration process: ", err);
      setErrMsg("Network error or something went wrong, try again!");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Create Account</h1>

        {errMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">
            {errMsg}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-400"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-400"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
