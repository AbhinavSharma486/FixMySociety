import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Upload, AlertTriangle, FileText, Image, Video, Plus, ArrowLeft, LoaderCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getComplaintById, updateComplaint } from '../lib/complaintService';
import { useParams, useNavigate } from 'react-router-dom';

const EditComplaintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Plumbing');
  const [newlySelectedImages, setNewlySelectedImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const fetchComplaintDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getComplaintById(id);
      const complaint = data.complaint;
      setTitle(complaint.title || '');
      setDescription(complaint.description || '');
      setType(complaint.category || 'Plumbing');
      setImagesPreviews(complaint.images || []);
      setVideoPreview(complaint.video || '');
      setVideo(complaint.video ? { name: 'existing_video', url: complaint.video, type: 'video/mp4' } : null);
      if (complaint.images.length > 0 || complaint.video) {
        setUploadComplete(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch complaint details for editing.');
      toast.error(err.message || 'Failed to fetch complaint details for editing.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComplaintDetails();
  }, [fetchComplaintDetails]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadComplete(false);
    }
    setNewlySelectedImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagesPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadComplete(false);
      setVideo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !type.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setUploadComplete(false);
    const hasNewMediaToUpload = newlySelectedImages.length > 0 || (video && video instanceof File);
    if (hasNewMediaToUpload) {
      setIsUploading(true);
      setUploadProgress(0);
    } else {
      setIsUploading(false);
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', type);
    const existingImageUrls = imagesPreviews.filter(img => img.startsWith && img.startsWith('https://'));
    if (existingImageUrls.length > 0) {
      existingImageUrls.forEach(url => formData.append('existingImages', url));
    }

    newlySelectedImages.forEach((image) => {
      formData.append('images', image);
    });

    if (video && typeof video === 'object' && video.url) {
      formData.append('existingVideo', video.url);
    } else if (video && typeof video === 'object' && video instanceof File) {
      formData.append('video', video);
    }

    try {
      await updateComplaint(id, formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      toast.success('Complaint updated successfully!');
      setUploadComplete(true);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      toast.error(err.message || 'Failed to update complaint.');
    } finally {
      setSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (indexToRemove) => {
    const updatedImagesPreviews = imagesPreviews.filter((_, index) => index !== indexToRemove);
    setImagesPreviews(updatedImagesPreviews);

    const removedPreview = imagesPreviews[indexToRemove];
    if (removedPreview && !removedPreview.startsWith('https://')) {
      const newNewlySelectedImages = newlySelectedImages.filter((_, i) => {
        const correspondingPreviewIndex = imagesPreviews.filter(p => !p.startsWith('https://')).indexOf(removedPreview);
        return i !== correspondingPreviewIndex;
      });
      setNewlySelectedImages(newNewlySelectedImages);
    }

    if (updatedImagesPreviews.length === 0 && !video) {
      setUploadComplete(false);
    }
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoPreview('');
    if (imagesPreviews.length === 0 && !video) {
      setUploadComplete(false);
    }
  };

  const complaintTypes = [
    'Plumbing',
    'Water Management',
    'Electricity',
    'Security',
    'Waste Management',
    'Building Structure',
    'Elevators',
    'Parking',
    'Fire Safety',
    'Financial Issues',
    'Social Nuisances',
    'Emergency',
    'Other'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/40 flex items-center justify-center p-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center space-y-6"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-100/20 to-purple-100/20 animate-pulse"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-slate-800">Loading complaint details</p>
            <p className="text-sm text-slate-500">Please wait while we fetch your information...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/40 to-pink-50/40 flex items-center justify-center p-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-red-100/50 max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Oops! Something went wrong</h3>
          <p className="text-red-600 text-sm mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-100/10 to-purple-100/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-start justify-center p-3 sm:p-6 pt-20 sm:pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-4xl"
        >
          {/* Main Container */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] shadow-2xl shadow-black/5 border border-white/20 overflow-hidden">
            {/* Header Section */}
            <div className="relative px-6 sm:px-10 py-8 sm:py-12 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl border-b border-white/20">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white backdrop-blur-sm rounded-2xl border border-white/40 hover:border-white/60 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition-colors" />
              </motion.button>

              <div className="text-center ml-16 sm:ml-0">
                <motion.h1
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 bg-clip-text text-transparent mb-3"
                >
                  Edit Issue
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-slate-600 text-sm sm:text-base font-medium"
                >
                  Update your complaint with the latest information
                </motion.p>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-6 sm:px-10 py-8 sm:py-12">
              <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12">
                {/* Issue Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="space-y-4"
                >
                  <label className="block text-base sm:text-lg font-bold text-slate-800 mb-3">
                    Issue Title <span className="text-red-500 font-normal">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-6 py-4 sm:py-5 text-base sm:text-lg bg-white/60 backdrop-blur-sm border-2 border-slate-200/60 hover:border-slate-300/80 focus:border-blue-500/80 rounded-2xl sm:rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-slate-900 placeholder-slate-500 font-medium shadow-sm hover:shadow-md focus:shadow-lg"
                      placeholder="e.g., Leaky pipe in the kitchen"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="space-y-4"
                >
                  <label className="block text-base sm:text-lg font-bold text-slate-800 mb-3">
                    Description <span className="text-red-500 font-normal">*</span>
                  </label>
                  <div className="relative group">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-6 py-4 sm:py-5 text-base sm:text-lg bg-white/60 backdrop-blur-sm border-2 border-slate-200/60 hover:border-slate-300/80 focus:border-blue-500/80 rounded-2xl sm:rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 min-h-[140px] sm:min-h-[160px] resize-none text-slate-900 placeholder-slate-500 font-medium shadow-sm hover:shadow-md focus:shadow-lg"
                      placeholder="Provide detailed information about the issue, including when it started, location, and any relevant context..."
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </motion.div>

                {/* Issue Type */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="space-y-4"
                >
                  <label className="block text-base sm:text-lg font-bold text-slate-800 mb-3">
                    Issue Category <span className="text-red-500 font-normal">*</span>
                  </label>
                  <div className="relative group">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-6 py-4 sm:py-5 text-base sm:text-lg bg-white/60 backdrop-blur-sm border-2 border-slate-200/60 hover:border-slate-300/80 focus:border-blue-500/80 rounded-2xl sm:rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-slate-900 appearance-none cursor-pointer font-medium shadow-sm hover:shadow-md focus:shadow-lg"
                    >
                      {complaintTypes.map((complaintType) => (
                        <option key={complaintType} value={complaintType}>
                          {complaintType}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </motion.div>

                {/* Images Upload */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="space-y-6"
                >
                  <label className="block text-base sm:text-lg font-bold text-slate-800 mb-3">
                    Upload Images
                    <span className="text-slate-500 text-sm sm:text-base font-normal ml-2">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <motion.button
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full p-8 sm:p-12 border-3 border-dashed border-slate-300/80 hover:border-blue-400/80 rounded-3xl hover:bg-gradient-to-br hover:from-blue-50/40 hover:to-purple-50/30 transition-all duration-500 flex flex-col items-center justify-center gap-4 sm:gap-6 group backdrop-blur-sm shadow-sm hover:shadow-lg"
                    disabled={isUploading}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg">
                      <Image className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg sm:text-xl text-slate-700 font-bold mb-2">Click to upload images</p>
                      <p className="text-sm sm:text-base text-slate-500 font-medium">PNG, JPG, GIF up to 10MB each</p>
                    </div>
                  </motion.button>

                  {imagesPreviews.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mt-8"
                    >
                      {imagesPreviews.map((preview, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          className="relative group"
                        >
                          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-100 aspect-square shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-3 -right-3 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {(isUploading || uploadComplete) && (newlySelectedImages.length > 0 || !!video || imagesPreviews.filter(img => img.startsWith && img.startsWith('https://')).length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="p-6 sm:p-8 bg-gradient-to-r from-slate-50/80 to-blue-50/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-slate-200/40 shadow-sm"
                    >
                      {isUploading ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 text-base sm:text-lg font-semibold text-slate-700">
                            <div className="relative">
                              <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                            </div>
                            <span>Uploading files... {uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                            <motion.div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full shadow-sm"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      ) : uploadComplete ? (
                        <div className="flex items-center gap-4 text-green-600 text-base sm:text-lg font-semibold">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>Files uploaded successfully!</span>
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </motion.div>

                {/* Video Upload */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="space-y-6"
                >
                  <label className="block text-base sm:text-lg font-bold text-slate-800 mb-3">
                    Upload Video
                    <span className="text-slate-500 text-sm sm:text-base font-normal ml-2">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoChange}
                    accept="video/*"
                    className="hidden"
                  />
                  <motion.button
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full p-8 sm:p-12 border-3 border-dashed border-slate-300/80 hover:border-purple-400/80 rounded-3xl hover:bg-gradient-to-br hover:from-purple-50/40 hover:to-blue-50/30 transition-all duration-500 flex flex-col items-center justify-center gap-4 sm:gap-6 group backdrop-blur-sm shadow-sm hover:shadow-lg"
                    disabled={isUploading}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg">
                      <Video className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg sm:text-xl text-slate-700 font-bold mb-2">Click to upload video</p>
                      <p className="text-sm sm:text-base text-slate-500 font-medium">MP4, MOV, AVI up to 50MB</p>
                    </div>
                  </motion.button>

                  {videoPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="relative group mt-8"
                    >
                      <div className="relative overflow-hidden rounded-3xl bg-slate-100 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                        <video
                          src={videoPreview}
                          controls
                          className="w-full rounded-3xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none"></div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={removeVideo}
                        className="absolute -top-3 -right-3 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>

                {/* Emergency Warning */}
                {type === 'Emergency' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-3xl animate-pulse"></div>
                    <div className="relative flex items-start gap-6 p-6 sm:p-8 bg-gradient-to-r from-red-50/80 via-orange-50/60 to-red-50/80 backdrop-blur-sm border-2 border-red-200/60 rounded-3xl shadow-lg">
                      <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center shadow-lg">
                        <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg sm:text-xl font-bold text-red-800">Emergency Issue Alert</h4>
                        <p className="text-base sm:text-lg text-red-700 leading-relaxed font-medium">
                          This complaint will be flagged as an emergency and will receive immediate priority attention from our support team.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col sm:flex-row justify-end gap-4 sm:gap-6 pt-8 sm:pt-12"
                >
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => navigate('/')}
                    className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-lg font-bold text-slate-700 bg-white/80 hover:bg-white backdrop-blur-sm border-2 border-slate-200/60 hover:border-slate-300/80 rounded-2xl sm:rounded-3xl transition-all duration-300 shadow-lg hover:shadow-xl order-2 sm:order-1"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-lg bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 text-white rounded-2xl sm:rounded-3xl transition-all duration-300 font-bold flex items-center justify-center gap-3 sm:gap-4 shadow-xl hover:shadow-2xl backdrop-blur-sm border border-white/20 order-1 sm:order-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={submitting || isUploading}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      {(submitting || isUploading) ? (
                        <div className="relative">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                      ) : uploadComplete ? (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                      <span className="font-bold">
                        {(submitting || isUploading) ? 'Updating Issue...' : 'Update Issue'}
                      </span>
                    </div>
                  </motion.button>
                </motion.div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EditComplaintPage;