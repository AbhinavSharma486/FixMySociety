import Complaint from "../models/complaint.model.js";
import Building from "../models/building.model.js";
import User from "../models/user.model.js";

let searchFiltersCache = null;
let searchFiltersCacheTimestamp = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

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
        .select('_id title description user buildingName category status createdAt images video') // Select only essential complaint fields
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

      // Use aggregation to get complaint counts for buildings, similar to getAllBuildingsAdmin
      const buildings = await Building.aggregate([
        { $match: buildingQuery }, // Apply initial query filters
        {
          $lookup: {
            from: 'complaints',
            localField: 'complaints',
            foreignField: '_id',
            as: 'complaintsDocs'
          }
        },
        {
          $project: {
            buildingName: 1,
            numberOfFlats: 1,
            filledFlats: 1,
            emptyFlats: 1,
            createdAt: 1,
            complaintsCount: { $size: "$complaintsDocs" },
            pendingCount: { $size: { $filter: { input: "$complaintsDocs", as: "complaint", cond: { $eq: ["$$complaint.status", "Pending"] } } } },
            inProgressCount: { $size: { $filter: { input: "$complaintsDocs", as: "complaint", cond: { $eq: ["$$complaint.status", "In Progress"] } } } },
            resolvedCount: { $size: { $filter: { input: "$complaintsDocs", as: "complaint", cond: { $eq: ["$$complaint.status", "Resolved"] } } } },
            emergencyCount: { $size: { $filter: { input: "$complaintsDocs", as: "complaint", cond: { $eq: ["$$complaint.category", "Emergency"] } } } },
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        { $skip: (page - 1) * limit },
        { $limit: limit * 1 }
      ]);

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
        .select('_id fullName email flatNumber buildingName profilePic role isVerified') // Select essential user fields
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
    console.error("Error in globalSearch:", error.stack || error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get search filters and options 
export const getSearchFilters = async (req, res) => {
  try {
    // Check if cache is valid
    if (searchFiltersCache && searchFiltersCacheTimestamp && (Date.now() - searchFiltersCacheTimestamp < CACHE_DURATION)) {
      return res.status(200).json({
        success: true,
        filters: searchFiltersCache
      });
    }

    const [categories, statuses, buildings, priorities] = await Promise.all([
      Complaint.distinct('category'),
      Complaint.distinct('status'),
      Building.distinct('buildingName'),
      Complaint.distinct('priority')
    ]);

    const filters = {
      categories,
      statuses,
      buildings,
      priorities
    };

    res.status(200).json({
      success: true,
      filters: filters
    });

    // Update cache
    searchFiltersCache = filters;
    searchFiltersCacheTimestamp = Date.now();

  } catch (error) {
    console.error("Error in getSearchFilters:", error.stack || error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};