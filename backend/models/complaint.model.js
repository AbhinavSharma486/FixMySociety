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
  flatNumber: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["Plumbing", "Water Management", "Electricity", "Security", "Waste Management", "Building Structure", "Elevators", "Parking", "Fire Safety", "Financial Issues", "Social Nuisances", "Emergency", "Other"],
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
  video: {
    type: String,
  },
  comments: [
    {
      user: mongoose.Schema.Types.Mixed, // Change to Mixed type
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      editedAt: { type: Date },
      authorRole: { type: String, enum: ["user", "admin"], default: "user" },
      // Support replies to comments (simple nested array)
      replies: [
        {
          user: mongoose.Schema.Types.Mixed, // Change to Mixed type
          text: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
          editedAt: { type: Date },
          authorRole: { type: String, enum: ["user", "admin"], default: "user" }
        }
      ]
    }
  ],
}, { timestamps: true });

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;