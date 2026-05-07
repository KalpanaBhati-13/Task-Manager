import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

const secretKey = process.env.JWT_SECRET || "myverysecretkey123"
const key = new TextEncoder().encode(secretKey)

// paths that dont need auth
const publicPaths = ["/login", "/register", "/api/auth/login", "/api/auth/register"]

export async function middleware(req) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get("token")?.value

  var isPublic = publicPaths.some(p => pathname.startsWith(p))

  // if public path
  if(isPublic) {
    // if already logged in, send to dashboard
    if(token) {
      try {
        await jwtVerify(token, key)
        if(pathname === "/login" || pathname === "/register") {
          return NextResponse.redirect(new URL("/dashboard", req.url))
        }
      } catch(e) {
        // token bad, let them through
      }
    }
    return NextResponse.next()
  }

  // root path redirect
  if(pathname === "/") {
    if(token) {
      try {
        await jwtVerify(token, key)
        return NextResponse.redirect(new URL("/dashboard", req.url))
      } catch(e) {}
    }
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // check auth for everything else
  if(!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    const { payload } = await jwtVerify(token, key)
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-user-id", payload.userId)
    requestHeaders.set("x-user-role", payload.role)

    return NextResponse.next({
      request: { headers: requestHeaders }
    })
  } catch(e) {
    // token expired or invalid
    const res = NextResponse.redirect(new URL("/login", req.url))
    res.cookies.delete("token")
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
}
