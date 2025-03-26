import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  buildingName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Building",
    required: true
  },
  category: {
    type: String,
    enum: ["Plumbing", "Electricity", "Security", "Other"],
    required: true
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending"
  },
  images: [
    {
      type: String
    }
  ],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;