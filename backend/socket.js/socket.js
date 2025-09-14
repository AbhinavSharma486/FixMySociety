import { Server } from "socket.io";
import http from "http";
import express from "express";
import socketAuth from "../middleware/socketAuth.middleware.js";
import Complaint from "./../models/complaint.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", process.env.FRONTEND_URL, "*"], // Temporarily add '*' for debugging
    methods: ["GET", "POST"],
  },
});

io.use(socketAuth);

io.on("connection", (socket) => {
  const clientType = socket.user ? "User" : socket.admin ? "Admin" : "Anonymous";
  const clientName = socket.user?.fullName || socket.admin?.fullName || 'Anonymous';

  // Join user specific room
  if (socket.user) {
    socket.join(socket.user._id.toString()); // user joins their personal room

    if (socket.user.buildingName) {
      socket.join(socket.user.buildingName);
    }

    socket.emit('connectionSuccess', { userId: socket.user._id.toString() });
  }

  // Admin joins a general admin room and their personal room
  if (socket.admin) {
    socket.join("adminRoom");
    socket.join(socket.admin._id.toString()); // Admin joins their personal room
  }

  // Handle joining a complaint specific room for comments
  socket.on("joinComplaintRoom", async (complaintId) => {
    try {
      // Basic authorization check: ensure user is part of the building or is an admin
      if (!socket.user && !socket.admin) {
        const errorMessage = "Authentication required to join complaint room.";
        return socket.emit("error", { message: errorMessage });
      }

      const complaint = await Complaint.findById(complaintId).populate('buildingName');

      if (!complaint) {
        return socket.emit("error", { message: "Complaint not found." });
      }

      const userBuilding = socket.user?.buildingName;
      const complaintBuilding = complaint.buildingName?.buildingName;

      // Admins can join any room. Users can only join rooms for their building.
      if (socket.admin || (userBuilding && complaintBuilding && userBuilding === complaintBuilding)) {
        socket.join(complaintId);
      }
      else {
        return socket.emit("error", { message: "Unauthorized to access this complaint." });
      }
    } catch (error) {
      socket.emit("error", { message: "Internal server error while joining complaint room." });
    }
  });

  socket.on("leaveComplaintRoom", (complaintId) => {
    socket.leave(complaintId);
  });

  socket.on("disconnect", () => {
    console.log(`${clientType} ${clientName} disconnected: ${socket.id}`);
  });

});

export { app, io, server };