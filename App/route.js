import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/db"
import User from "@/models/User"
import { createToken } from "@/lib/auth"

export async function POST(req) {
  try {
    await connectDB()
    const { email, password } = await req.json()

    if(!email || !password) {
      return NextResponse.json({ error: "email and password required" }, { status: 400 })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if(!user) {
      return NextResponse.json({ error: "invalid credentials" }, { status: 401 })
    }

    const match = await bcrypt.compare(password, user.password)
    if(!match) {
      return NextResponse.json({ error: "invalid credentials" }, { status: 401 })
    }

    const token = await createToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    })

    const res = NextResponse.json({
      message: "logged in",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7  // 7 days
    })

    return res

  } catch(err) {
    console.log("login err:", err)
    return NextResponse.json({ error: "login failed" }, { status: 500 })
  }
}
