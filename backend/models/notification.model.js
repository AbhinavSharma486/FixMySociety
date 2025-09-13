import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Can also be Admin if an admin sends a notification
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      default: "user", // Default to user if not specified
    },
    type: {
      type: String,
      enum: [
        "complaint_created",
        "complaint_updated",
        "complaint_resolved",
        "comment_added",
        "like_received",
        "status_changed",
        "admin_message",
        "system_alert"
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedComplaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
    relatedBuilding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
    },
    broadcast: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Broadcast',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent", "info", "warning"],
      default: "info",
    },
    expiresAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      }
    }
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;