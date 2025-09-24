import Complaint from "../models/complaint.model.js";
import Building from "../models/building.model.js";
import User from "../models/user.model.js";


// Advanced search across all entities 
export const globalSearch = async (req, res) => {
  try {
    const {
      query, type = 'all', category, status, building, dateFrom, dateTo, priority, page = 1, limit = 20
    } = req.query;

    const searchQuery = {};

    let results = {};

    // Build search query based on type
    if (type === 'complaints' || type === 'all') {
      const complaintQuery = {};

      if (query) {
        complaintQuery.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ];
      }

      if (category) complaintQuery.category = category;
      if (status) complaintQuery.status = status;
      if (building) complaintQuery.buildingName = building;
      if (priority) complaintQuery.priority = priority;

      if (dateFrom || dateTo) {
        complaintQuery.createdAt = {};

        if (dateFrom) complaintQuery.createdAt.$gte = new Date(dateFrom);

        if (dateTo) complaintQuery.createdAt.$lte = new Date(dateTo);
      }

      const complaints = await Complaint.find(complaintQuery)
        .populate('user', 'fullName email flatNumber')
        .populate('buildingName', 'buildingName')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const totalComplaints = await Complaint.countDocuments(complaintQuery);

      results.complaints = {
        data: complaints,
        total: totalComplaints,
        page: parseInt(page),
        totalPages: Math.ceil(totalComplaints / limit)
      };
    }

    if (type === 'buildings' || type === 'all') {
      const buildingQuery = {};

      if (query) {
        buildingQuery.$or = [
          { buildingName: { $regex: query, $options: 'i' } }
        ];
      }

      const buildings = await Building.find(buildingQuery)
        .populate('complaints')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const totalBuildings = await Building.countDocuments(buildingQuery);

      results.buildings = {
        data: buildings,
        total: totalBuildings,
        page: parseInt(page),
        totalPages: Math.ceil(totalBuildings / limit)
      };
    }

    if (type === 'users' || type === 'all') {
      const userQuery = {};

      if (query) {
        userQuery.$or = [
          { fullName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { flatNumber: { $regex: query, $options: 'i' } }
        ];
      }

      const users = await User.find(userQuery)
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const totalUsers = await User.countDocuments(userQuery);

      results.users = {
        data: users,
        total: totalUsers,
        page: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit)
      };
    }

    res.status(200).json({
      success: true,
      results,
      query: {
        search: query,
        type,
        category,
        status,
        building,
        dateFrom,
        dateTo,
        priority
      }
    });
  } catch (error) {
    console.log("Error in globalSearch:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};