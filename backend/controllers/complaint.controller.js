import { v2 as cloudinary } from "cloudinary";

import Building from "../models/building.model.js";
import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
import { emitCommentAdded, emitComplaintCreated, emitComplaintDeleted, emitComplaintStatusUpdated, emitComplaintUpdated, emitLikeToggled, emitReplyAdded } from "../sockets/eventEmitter.js";

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
      .populate("buildingName", "buildingName")
      .select('_id title description user buildingName flatNumber category likes status images video createdAt comments'); // Explicitly select all necessary fields

    emitComplaintCreated(populatedComplaint);

    res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      complaint: populatedComplaint
    });
  } catch (error) {
    console.error("Error creating complaint:", error.stack || error);
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
      .select('_id title description user buildingName flatNumber category likes status createdAt images') // Select only summary fields
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      complaints
    });
  } catch (error) {
    console.error("Error fetching all complaints:", error.stack || error);
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
    console.error("Error fetching complaint by ID:", error.stack || error);
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
      .populate("comments.user", "fullName profilePic")
      .select('_id title description user buildingName flatNumber category likes status images video createdAt updatedAt comments'); // Select all necessary fields

    emitComplaintUpdated(populatedComplaint);

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      complaint: populatedComplaint // Return the populated complaint
    });

  } catch (error) {
    console.error("Error updating complaint:", error.stack || error);
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
    console.error("Error deleting complaint:", error.stack || error);
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
      .populate("buildingName", "buildingName")
      .select('_id status user buildingName category flatNumber'); // Select only essential fields for status update

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
    console.error("Error updating complaint status:", error.stack || error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Like a complaint
export const likeComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user._id;

    const complaint = await Complaint.findById(id)
      .populate("user", "_id fullName");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    const isLiked = complaint.likes.includes(userId);

    if (!isLiked) {
      complaint.likes.pull(userId);
    }
    else {
      complaint.likes.push(userId); // The notification will be sent after saving to DB
    }

    await complaint.save();

    emitLikeToggled(complaint);

    res.status(200).json({
      success: true,
      likes: complaint.likes,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error("Error liking complaint:", error.stack || error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Add a new comment/reply under complaint 
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;

    const { text } = req.body;

    const authorRole = req.admin ? 'admin' : 'user';

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Comment text cannot be empty."
      });
    }

    const complaint = await Complaint.findById(id)
      .select('_id comments user buildingName') // Only need _id and comments to push, and user/buildingName for auth/emit
      .populate("user", "_id fullName")
      .populate("buildingName", "buildingName");

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    // Authorization : Check if requester (user or admin) is authorized

    let isAuthorized = false;

    if (req.user) {
      const user = await User.findById(req.user._id).select('buildingName');

      const userBuildingName = user ? user.buildingName : null;

      if (userBuildingName && complaint.buildingName.buildingName === userBuildingName) {
        isAuthorized = true;
      }
    }

    if (req.admin) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to comment on this complaint."
      });
    }

    let commentUser = null;

    if (authorRole === 'admin' && req.admin) {
      commentUser = {
        _id: req.admin._id,
        fullName: req.admin.fullName || 'Admin',
        profilePic: req.admin.profilePic || "https://cdn.pixabay.com/photo/2017/02/10/02/54/admin-2055371_1280.png",
        authorRole: 'admin'
      };
    }
    else if (authorRole === 'user' && req.user) {
      const user = await User.findById(req.user._id).select('fullName profilePic flatNumber');

      if (user) {
        commentUser = {
          _id: user._id,
          fullName: user.fullName,
          profilePic: user.profilePic,
          flatNumber: user.flatNumber,
          authorRole: 'user'
        };
      }
    }

    if (!commentUser) {
      return res.status(400).json({
        success: false,
        message: "Could not resolve comment author details."
      });
    }

    const newComment = {
      user: commentUser,
      text,
      replies: [],
      authorRole,
      createdAt: new Date()
    };

    const { parentCommentId } = req.body;

    if (parentCommentId) {
      const parent = complaint.comments.id(parentCommentId);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found"
        });
      }

      parent.replies.push({
        user: commentUser,
        text,
        authorRole,
        createdAt: new Date()
      });
    }
    else {
      complaint.comments.push(newComment);
    }

    await complaint.save();

    // After saving, find the newly added comment/reply to emit it with populated data
    let emittedComment = null;

    let emittedReply = null;

    if (parentCommentId) {
      const parentComment = complaint.comments.id(parentCommentId);

      emittedReply = parentComment.replies[parentComment.replies.length - 1];

      emitReplyAdded({
        complaintId: complaint._id,
        parentCommentId: parentCommentId,
        reply: emittedReply
      });
    }
    else {
      emittedComment = complaint.comments[complaint.comments.length - 1];

      emitCommentAdded({
        complaintId: complaint._id,
        comment: emittedComment
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      comment: emittedComment || emittedReply
    });
  } catch (error) {
    console.error("Error adding comment:", error.stack || error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Edit a comment or reply
export const editComment = async (req, res) => {
  try {
    const { id } = req.params; // complaint id

    const { commentId, replyId, text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Text required"
      });
    }

    const complaint = await Complaint.findById(id).select('_id comments'); // Only need _id and comments to edit

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    // If replyId provided, then edit a reply
    if (replyId && commentId) {
      const parent = complaint.comments.id(commentId);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Comment not found"
        });
      }

      const reply = parent.replies.id(replyId);

      if (!reply) {
        return res.status(404).json({
          success: false,
          message: "Reply not found"
        });
      }

      const requesterId = req.user?._id?.toString() || req.admin?._id?.toString();

      const replyAuthorId = reply.user?.id?.toString();

      // check if the author role matches the requester role (user or admin)
      const isOwner = requesterId === replyAuthorId;

      const isRoleMatch = (req.user && reply.authorRole === 'user') || (req.admin && reply.authorRole === 'admin');

      if (!isOwner || !isRoleMatch) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to edit this reply"
        });
      }

      reply.text = text;
      reply.editedAt = new Date();
      await complaint.save();

      return res.status(200).json({
        success: true,
        message: "Reply edited",
        comments: complaint.comments
      });
    }

    // Edit a top level comment
    if (commentId) {
      const comment = complaint.comments.id(commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found"
        });
      }

      const requesterId = req.user?._id?.toString() || req.admin?._id?.toString();

      const commentAuthorId = comment.user?._id?.toString();

      // check if the author role matches the requrester role (user or admin)
      const isOwner = requesterId === commentAuthorId;

      const isRoleMatch = (req.user && comment.authorRole === 'user') || (req.admin && comment.authorRole === 'admin');

      if (!isOwner || !isRoleMatch) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to edit this comment"
        });
      }

      comment.text = text;
      comment.editedAt = new Date();

      await complaint.save();

      return res.status(200).json({
        success: true,
        message: "Comment edited",
        comments: complaint.comments
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid request"
    });
  } catch (error) {
    console.error('Error editing comment:', error.stack || error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete a comment or reply
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params; // complaint id

    // Accept commentId / replyId from body or query (some clients send DELETE with query params)
    const commentId = req.body?.commentId || req.query?.commentId;

    const replyId = req.body?.commentId || req.query?.replyId;

    // Ensure requester is authenticated (user or admin)
    if (!req.user && !req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const complaint = await Complaint.findById(id).select('_id comments'); // Only need _id and comments to delete

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    const requesterId = req.user?._id?.toString() || req.admin?._id?.toString();

    if (replyId && commentId) {
      const parent = complaint.comments.id(commentId);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Comment not found"
        });
      }

      const reply = parent.replies.id(replyId);

      if (!reply) {
        return res.status(404).json({
          success: false,
          message: "Reply not found"
        });
      }

      // Only author of reply can delete their reply
      const isOwner = requesterId === reply.user?._id?.toString();

      const isRoleMatch = (req.user && reply.authorRole === 'user') || (req.admin && reply.authorRole === 'admin');

      if (!isOwner || !isRoleMatch) {
        return res.stattus(403).json({
          success: false,
          message: "Unauthorized to delete this reply"
        });
      }

      // Remove reply robustly (support both subdocument remove() and plain arrays)
      if (typeof reply.remove === 'function') {
        reply.remove();
      }
      else {
        parent.replies = parent.replies.filter(r => String(r._id) !== String(replyId));
      }

      await complaint.save();

      return res.status(200).json({
        success: true,
        message: "Reply deleted",
        comments: complaint.comments
      });
    }

    if (commentId) {
      const comment = complaint.comments.id(commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      // Only author of comment can delete their comment, Admins cannot delete user's comments per requirement.
      const isOwner = requesterId === comment.user?._id?.toString();

      const isRoleMatch = (req.user && comment.authorRole === 'user') || (req.admin && comment.authorRole === 'admin');

      if (!isOwner || !isRoleMatch) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to delete this comment"
        });
      }

      // Remove comment rebustly
      if (typeof comment.remove === 'function') {
        comment.remove();
      }
      else {
        complaint.comments = complaint.comments.filter(c => String(c._id) !== String(commentId));
      }

      await complaint.save();

      return res.status(200).json({
        success: true,
        message: "Comment Delted",
        comments: complaint.comments
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid request'
    });
  } catch (error) {
    console.error('Error deleting comment:', error.stack || error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};