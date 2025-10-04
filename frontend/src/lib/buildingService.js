import { axiosInstance as axios } from './axios';

// Create new building
export const createBuilding = async (buildingData) => {
  try {
    const response = await axios.post('/api/buildings/create', buildingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create building' };
  }
};

// Get all buildings
export const getAllBuildings = async () => {
  try {
    const response = await axios.get('/api/buildings/all');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch buildings' };
  }
};

// Get all buildings with detailed info (Admin only)
export const getAllBuildingsAdmin = async () => {
  try {
    const response = await axios.get('/api/admin/buildings'); // Corrected endpoint
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch all buildings' };
  }
};

// Get building by ID
export const getBuildingById = async (id) => {
  try {
    const response = await axios.get(`/api/buildings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch building' };
  }
};

// Update building
export const updateBuilding = async (id, updateData) => {
  try {
    const response = await axios.put(`/api/buildings/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update building' };
  }
};

// Delete building
export const deleteBuilding = async (id) => {
  try {
    const response = await axios.delete(`/api/buildings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete building' };
  }
};

// Get building statistics
export const getBuildingStats = async (id) => {
  try {
    const response = await axios.get(`/api/buildings/${id}/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch building stats' };
  }
};
