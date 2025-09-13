import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  senderRole: {
    type: String,
    default: 'admin',
  },
  title: {
    type: String,
    required: true,
    default: 'Admin Broadcast',
  },
  message: {
    type: String,
    require: true,
  },
  priority: {
    type: String,
    enum: ['info', 'warning', 'emergency', 'low', 'medium', 'high'],
    default: 'info',
  },
  relatedBuilding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    default: null,
  }
}, { timestamps: true });

console.log("Broadcast Model Loaded. Priority Enum:",
  broadcastSchema.path('priority').enumValues);

const Broadcast = mongoose.model("Broadcast", broadcastSchema);

export default Broadcast;