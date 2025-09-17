import { v2 as cloudinary } from "cloudinary";

import Building from "../models/building.model.js";
import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
import { emitComplaintCreated, emitComplaintDeleted, emitComplaintStatusUpdated, emitComplaintUpdated } from "../sockets/eventEmitter.js";

// Create new complaint
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    let images = [];

    if (req.files && req.files.images) {
      if (Array.isArray(req.files.images)) {
        images = req.files.images;
      }
      else {
        images = [req.files.images];
      }
    }

    let videoFile = null;

    if (req.files && req.files.video) {
      videoFile = req.files.video;
    }

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description and category are required."
      });
    }

    // check if the buildingName (string) exists and get its objectId
    const existingBuilding = await Building.findOne(
      {
        buildingName: new RegExp(`^${req.user.buildingName}$`, 'i')
      }
    );

    if (!existingBuilding) {
      return res.status(400).json({
        success: false,
        message: "Building not found."
      });
    }

    // Upload images to cloudinary
    const uploadedImageUrls = [];

    for (const imageFile of images) {
      const result = await cloudinary.uploader.upload(imageFile.tempFilePath, {
        folder: "complaint_images",
      });
      uploadedImageUrls.push(result.secure_url);
    }

    // Upload video to cloudinary
    let uploadedVideoUrl = null;

    if (videoFile) {
      const result = await cloudinary.uploader.upload(videoFile.tempFilePath, {
        folder: "complaint_videos",
        resource_type: "video",
      });
      uploadedVideoUrl = result.secure_url;
    }

    const newComplaint = new Complaint({
      title,
      description,
      user: req.user._id,
      buildingName: existingBuilding._id, // store building objectId
      flatNumber: req.user.flatNumber,
      category,
      images: uploadedImageUrls, // stores image url
      video: uploadedVideoUrl // stores video url
    });

    await newComplaint.save();

    // Update the user's complaints array
    await User.findByIdAndUpdate(req.user._id,
      { $push: { complaints: newComplaint._id } }
    );

    // Update the building's complaints array
    await Building.findByIdAndUpdate(existingBuilding._id,
      { $push: { complaints: newComplaint._id } }
    );

    const populatedComplaint = await Complaint.findById(newComplaint._id)
      .populate("user", "fullName buildingName flatNumber")
      .populate("buildingName", "buildingName");

    emitComplaintCreated(populatedComplaint);

    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      complaint: populatedComplaint
    });
  } catch (error) {
    console.error("Error creating complaint:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Restored : Get all complaints (can be filtered by user's building)
export const getAllComplaints = async (req, res) => {
  try {
    const { buildingName } = req.query; // filter by building name

    let query = {};

    if (buildingName) {
      const building = await Building.findOne(
        {
          buildingName: new RegExp(`^${buildingName}$`, 'i')
        }
      );

      if (building) {
        query.buildingName = building._id;
      }
      else {
        return res.status(404).json({
          success: false,
          message: "Building not found"
        });
      }
    }

    const complaints = await Complaint.find(query)
      .populate("user", "fullName profilePic flatNumber")
      .populate("buildingName", "buildingName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      complaints
    });
  } catch (error) {
    console.error("Error fetching all complaints:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Restored : Get Complaint by ID
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id)
      .populate("user", "fullName profilePic flatNumber")
      .populate("buildingName", "buildingName")
      .populate({
        path: 'comments.user',
        model: 'User',
        select: 'fullName profilePic flatNumber'
      })
      .populate({
        path: 'comments.user',
        model: 'Admin',
        select: 'fullName profilePic'
      })
      .populate({
        path: 'comments.replies.user',
        model: 'User',
        select: 'fullName profilePic flatNumber'
      })
      .populate({
        path: 'comments.replies.user',
        model: 'Admin',
        select: 'fullName profilePic'
      });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error("Error fetching complaint by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Restored : Update Complaint (can be by user or admin)
export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, description, category, existingImages, existingVideo } = req.body; // expect existing media URLs

    let newImages = [];

    if (req.files && req.files.images) {
      if (Array.isArray(req.files.images)) {
        newImages = req.files.images;
      }
      else {
        newImages = [req.files.images];
      }
    }

    let newVideoFile = null;

    if (req.files && req.files.video) {
      newVideoFile = req.files.video;
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    // Authorization : Only the create or an admin can update 
    const isAuthorized = complaint.user.toString() === req.user._id.toString() || req.admin;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this complaint"
      });
    }

    // Upload new images to cloudinary 
    const uploadedNewImageUrls = [];

    for (const imageFile of newImages) {
      const result = await cloudinary.uploader.upload(imageFile.tempFilePath, {
        folder: "complaint_images",
      });
      uploadedNewImageUrls.push(result.secure_url);
    }

    // Upload new video to cloudinary
    let uploadedNewVideoUrl = existingVideo || null; // Retain existing video URL if no new file

    if (newVideoFile) {
      const result = await cloudinary.uploader.upload(newVideoFile.tempFilePath, {
        folder: "complaint_videos",
        resource_type: "video"
      });
      uploadedNewVideoUrl = result.secure_url;
    }

    complaint.title = title || complaint.title;
    complaint.description = description || complaint.description;
    complaint.category = category || complaint.category;

    let existingImagesArr = [];

    if (existingImages) {
      if (Array.isArray(existingImages)) {
        existingImagesArr = existingImages;
      }
      else if (typeof existingImages === 'string') {

        // check if it's a JSON stringified array
        if (existingImages.startsWith('[') && existingImages.endsWith(']')) {
          try {
            existingImagesArr = JSON.parse(existingImages);
          } catch (error) {
            // if parsing fails, treat as a single URL
            existingImagesArr = [existingImages];
          }
        }
        else {
          // It's a single URL string
          existingImagesArr = [existingImages];
        }
      }
    }

    complaint.images = [...existingImagesArr, ...uploadedNewImageUrls];
    complaint.video = uploadedNewVideoUrl;

    await complaint.save();

    const populatedComplaint = await Complaint.findById(complaint.id)
      .populate("user", "fullName buildingName")
      .populate("buildingName", "buildingName")
      .populate("comments.user", "fullName profilePic");

    emitComplaintUpdated(populatedComplaint);

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      complaint
    });

  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Restored : Delete complaint (can only by user or admin)
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    // Authorization : Only the creator or an admin can delete
    const isAuthorized = complaint.user.toString() === req.user._id.toString() || req.admin;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this complaint"
      });
    }

    await Complaint.findByIdAndDelete(id);

    // Remove complaint form user's arrays
    await User.findByIdAndUpdate(
      complaint.user,
      { $pull: { complaints: id } }
    );

    // Remove complaint form building arrays
    await Building.findByIdAndUpdate(
      complaint.buildingName,
      { $pull: { complaints: id } }
    );

    // Notify admin as well so dashboard updates in real time when users delete complaints
    const toAdmin = true;
    emitComplaintDeleted(complaint, { toAdmin });

    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Restored : Update Complaint status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    if (!["Pending", "In Progress", "Resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const complaint = await Complaint.findById(id)
      .populate("user", "_id fullName buildingName")
      .populate("buildingName", "buildingName"); // Populate building name for room

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    complaint.status = status;

    await complaint.save();

    emitComplaintStatusUpdated(complaint);

    res.status(200).json({
      success: true,
      message: "Complaint status updated successfully",
      complaint
    });
  } catch (error) {
    console.error("Error updating complaint status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};