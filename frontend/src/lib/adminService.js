import { axiosInstance as axios } from './axios';

export const getAdminAnalytics = async () => {
  try {
    const response = await axios.get('/api/admin/analytics');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch admin analytics' };
  }
};

export const getAllComplaintsAdmin = async () => {
  try {
    const response = await axios.get('/api/admin/complaints');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch admin complaints' };
  }
};

// New: Get complaint by ID for Admin
export const getComplaintByIdAdmin = async (id) => {
  try {
    const response = await axios.get(`/api/admin/complaints/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch admin complaint details' };
  }
};

// New: Delete a complaint (Admin only)
export const deleteComplaintAdmin = async (complaintId) => {
  try {
    const response = await axios.delete(`/api/admin/complaints/${complaintId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete complaint' };
  }
};

// New: Update complaint status (Admin only)
export const updateComplaintStatusAdmin = async (complaintId, status) => {
  try {
    const response = await axios.put(`/api/complaints/${complaintId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update complaint status' };
  }
};

export const getAllBuildingsAdmin = async () => {
  try {
    const response = await axios.get('/api/admin/buildings');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch admin buildings' };
  }
};

// New: Get building by ID for Admin
export const getBuildingByIdAdmin = async (id) => {
  try {
    const response = await axios.get(`/api/admin/buildings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch admin building details' };
  }
};

// New: Add a resident to a building (Admin only)
export const addResidentByAdmin = async (buildingId, residentData) => {
  try {
    const response = await axios.post(`/api/admin/buildings/${buildingId}/residents`, residentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add resident' };
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get('/api/admin/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch all users' };
  }
};

export const updateUserRole = async (userId, roleData) => {
  try {
    const response = await axios.put(`/api/admin/users/${userId}/role`, roleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update user role' };
  }
};

export const updateUserBuildingAndFlat = async (userId, updateData) => {
  try {
    const response = await axios.put(`/api/admin/users/${userId}/building-flat`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update user building/flat' };
  }
};

// Renamed for clarity: deleteUser is used for general user deletion in admin context
export const deleteUserByAdmin = async (userId) => {
  try {
    const response = await axios.delete(`/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete user' };
  }
};

export const updateUserByAdmin = async (userId, userData) => {
  try {
    const response = await axios.put(`/api/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update user' };
  }
};

export const broadcastAlert = async (message, severity = 'info', targetBuilding = '') => {
  try {
    const response = await axios.post('/api/admin/broadcast-alert', { message, severity, targetBuilding });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to broadcast alert' };
  }
};

// New: Get all buildings for dropdown options
export const getBuildingOptions = async () => {
  try {
    const response = await axios.get('/api/admin/buildings/options');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch building options' };
  }
};

export const getAllBroadcasts = async () => {
  try {
    const response = await axios.get('/api/admin/broadcasts');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch broadcasts' };
  }
};

export const deleteBroadcastById = async (id) => {
  try {
    const response = await axios.delete(`/api/admin/broadcasts/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete broadcast' };
  }
};

// New Admin Profile Services
export const getAdminProfile = async () => {
  try {
    const response = await axios.get('/api/admin/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch admin profile' };
  }
};

export const updateAdminProfile = async (profileData) => {
  try {
    const response = await axios.put('/api/admin/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update admin profile' };
  }
};

export const changeAdminPassword = async (passwordData) => {
  try {
    const response = await axios.put('/api/admin/profile/password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to change admin password' };
  }
};