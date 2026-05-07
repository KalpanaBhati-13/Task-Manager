import mongoose from "mongoose"

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "member"],
    default: "member"
  },
  createdAt : {
    type: Date,
    default: Date.now
  }
})

const User = mongoose.models.User || mongoose.model("User", schema)
export default User
