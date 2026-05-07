import mongoose from "mongoose"

// store connection state outside the function
let connected = false

export async function connectDB() {
  if (connected) {
    return
  }

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not defined in the environment variables.")
    throw new Error("MONGODB_URI is not defined")
  }

  try{
    await mongoose.connect(process.env.MONGODB_URI)
    connected = true
    console.log("mongodb connected")
  } catch(err) {
    console.log("db connection error:", err.message)
    throw new Error("failed to connect db: " + err.message)
  }
}
