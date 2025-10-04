import { axiosInstance as axios } from './axios';

// Upload single file
export const uploadSingleFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/api/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'File upload failed' };
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (files) => {
  try {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
    });

    const response = await axios.post('/api/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Multiple file upload failed' };
  }
};

// Delete file
export const deleteFile = async (publicId) => {
  try {
    const response = await axios.delete(`/api/upload/${publicId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete file' };
  }
};

// Get file info
export const getFileInfo = async (publicId) => {
  try {
    const response = await axios.get(`/api/upload/${publicId}/info`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get file info' };
  }
};

// Validate file before upload
export const validateFile = (file, maxSize = 10 * 1024 * 1024) => {
  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Only images, PDFs, and Word documents are allowed.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get file preview URL
export const getFilePreviewUrl = (file) => {
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file);
  }
  return null;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};