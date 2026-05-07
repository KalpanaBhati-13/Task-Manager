import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import User from "@/models/User"
import { getCurrentUser } from "@/lib/auth"

// admin only - get all users
export async function GET() {
  try {
    const user = await getCurrentUser()
    if(!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    if(user.role !== "admin") {
      return NextResponse.json({ error: "admin only" }, { status: 403 })
    }

    await connectDB()
    const users = await User.find({}).select("-password").sort({ createdAt: -1 })

    return NextResponse.json({ users })
  } catch(err) {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

// update user role (admin only)
export async function PUT(req) {
  try {
    const curr = await getCurrentUser()
    if(!curr || curr.role !== "admin") {
      return NextResponse.json({ error: "admin only" }, { status: 403 })
    }

    await connectDB()
    const { userId, role } = await req.json()

    if(!userId || !role) {
      return NextResponse.json({ error: "userId and role required" }, { status: 400 })
    }

    if(!["admin", "member"].includes(role)) {
      return NextResponse.json({ error: "invalid role" }, { status: 400 })
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password")

    return NextResponse.json({ user: updated })
  } catch(err) {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
