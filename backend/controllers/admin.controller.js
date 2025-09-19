
import Complaint from "../models/complaint.model.js";


// Get all complaints across all buildings (Admin only)
export const getAllComplaintsAdmin = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'fullName email flatNumber')
      .populate('buildingName', 'buildingName')
      .select('title description user buildingName flatNumber category likes status images video createdAt') // Explicitly select video field
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      complaints
    });
  } catch (error) {
    console.log("Error in getAllComplaintsAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};