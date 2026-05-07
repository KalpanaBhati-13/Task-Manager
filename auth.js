import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secretKey = process.env.JWT_SECRET || "myverysecretkey123"
const key = new TextEncoder().encode(secretKey)

export async function createToken(data) {
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key)
  return token
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, key)
    return payload
  } catch(e) {
    return null
  }
}

// get logged in user from cookie
export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value

  if(!token) return null

  const payload = await verifyToken(token)
  return payload
}
