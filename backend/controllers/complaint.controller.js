import { v2 as cloudinary } from "cloudinary";

import Building from "../models/building.model.js";
import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
import { emitComplaintCreated } from "../sockets/eventEmitter.js";

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