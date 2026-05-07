import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Project from "@/models/Project"
import { getCurrentUser } from "@/lib/auth"

// add member to project
export async function POST(req, { params }) {
  try {
    const user = await getCurrentUser()
    if(!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    await connectDB()
    const project = await Project.findById(params.id)
    if(!project) return NextResponse.json({ error: "not found" }, { status: 404 })

    const isOwner = project.owner.toString() === user.userId
    if(!isOwner && user.role !== "admin") {
      return NextResponse.json({ error: "not allowed" }, { status: 403 })
    }

    const { userId } = await req.json()
    if(!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    // dont add if already member
    if(project.members.some(m => m.toString() === userId)) {
      return NextResponse.json({ error: "already a member" }, { status: 400 })
    }

    project.members.push(userId)
    await project.save()

    const updated = await Project.findById(params.id).populate("members", "name email")
    return NextResponse.json({ members: updated.members })
  } catch(err) {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

// remove member
export async function DELETE(req, { params }) {
  try {
    const user = await getCurrentUser()
    if(!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    await connectDB()
    const project = await Project.findById(params.id)
    if(!project) return NextResponse.json({ error: "not found" }, { status: 404 })

    const isOwner = project.owner.toString() === user.userId
    if(!isOwner && user.role !== "admin") {
      return NextResponse.json({ error: "not allowed" }, { status: 403 })
    }

    const { userId } = await req.json()
    project.members = project.members.filter(m => m.toString() !== userId)
    await project.save()

    return NextResponse.json({ message: "removed" })
  } catch(err) {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
