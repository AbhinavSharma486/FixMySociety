import { axiosInstance as axios } from './axios';

// Create new complaint
export const createComplaint = async (complaintData, onUploadProgress) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    };
    const response = await axios.post('/api/complaints/create', complaintData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create complaint' };
  }
};

// Get all complaints for authenticated user's building
export const getAllComplaints = async () => {
  try {
    const response = await axios.get('/api/complaints/all');
    return response.data;
  } catch (error) {
    // Gracefully handle empty/no-access states without toasting upstream
    if ([204, 401, 403, 404].includes(error.response?.status)) {
      return { complaints: [] };
    }
    throw error.response?.data || { message: 'Failed to fetch complaints' };
  }
};

// Get all complaints across all buildings (Admin only)
export const getAllComplaintsAdmin = async () => {
  try {
    const response = await axios.get('/api/admin/complaints'); // Corrected endpoint
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch all complaints' };
  }
};

// Get complaint by ID
export const getComplaintById = async (id) => {
  try {
    const response = await axios.get(`/api/complaints/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch complaint' };
  }
};

// Update complaint
export const updateComplaint = async (id, updateData, onUploadProgress) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    };
    const response = await axios.put(`/api/complaints/${id}`, updateData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update complaint' };
  }
};

// Delete complaint
export const deleteComplaint = async (id) => {
  try {
    const response = await axios.delete(`/api/complaints/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete complaint' };
  }
};

// Like/Unlike complaint
export const likeComplaint = async (id) => {
  try {
    const response = await axios.post(`/api/complaints/${id}/like`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to like complaint' };
  }
};

// Add comment to complaint
export const addComment = async (id, commentText, parentCommentId = null) => {
  try {
    const payload = { text: commentText, parentCommentId };
    if (parentCommentId) payload.parentCommentId = parentCommentId;
    const response = await axios.post(`/api/complaints/${id}/comment`, payload);
    return response; // Return the entire response object
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add comment' };
  }
};

// Update complaint status (Admin only)
export const updateComplaintStatus = async (id, status) => {
  try {
    const response = await axios.put(`/api/complaints/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update status' };
  }
};
