import { axiosInstance as axios } from './axios';

// Global search across all entities
export const globalSearch = async (params = {}) => {
  try {
    const response = await axios.get('/api/search/global', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Search failed' };
  }
};

// Get search suggestions for autocomplete
export const getSearchSuggestions = async (query, type = 'all') => {
  try {
    const response = await axios.get('/api/search/suggestions', {
      params: { query, type }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get search suggestions' };
  }
};

// Get available search filters
export const getSearchFilters = async () => {
  try {
    const response = await axios.get('/api/search/filters');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get search filters' };
  }
};

// Search complaints with filters
export const searchComplaints = async (searchParams) => {
  try {
    const params = { ...searchParams, type: 'complaints' };
    const response = await axios.get('/api/search/global', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search complaints' };
  }
};

// Search buildings with filters
export const searchBuildings = async (searchParams) => {
  try {
    const params = { ...searchParams, type: 'buildings' };
    const response = await axios.get('/api/search/global', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search buildings' };
  }
};

// Search users with filters
export const searchUsers = async (searchParams) => {
  try {
    const params = { ...searchParams, type: 'users' };
    const response = await axios.get('/api/search/global', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search users' };
  }
};