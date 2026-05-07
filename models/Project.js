import mongoose from "mongoose"

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  status: {
    type: String,
    enum: ["active", "completed", "on-hold"],
    default: "active"
  },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Project || mongoose.model("Project", projectSchema)
