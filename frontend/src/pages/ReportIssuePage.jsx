import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, AlertTriangle, FileText, Image, Video, Plus, ArrowLeft, LoaderCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { createComplaint } from '../lib/complaintService';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ReportIssuePage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Plumbing');
  const [newlySelectedImages, setNewlySelectedImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);

  useEffect(() => {
    return () => {
      setTitle('');
      setDescription('');
      setType('Plumbing');
      setNewlySelectedImages([]);
      setVideo(null);
      setImagesPreviews([]);
      setVideoPreview('');
      setLoading(false);
      setUploadProgress(0);
      setIsUploading(false);
      setUploadComplete(false);
    };
  }, []);

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

    setLoading(true);
    setUploadComplete(false);
    const hasMediaToUpload = newlySelectedImages.length > 0 || !!video;
    if (hasMediaToUpload) {
      setIsUploading(true);
      setUploadProgress(0);
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', type);
    formData.append('user', currentUser._id.toString());
    formData.append('buildingName', currentUser.buildingName.toString());
    formData.append('flatNumber', currentUser.flatNumber.toString());

    newlySelectedImages.forEach((image) => {
      formData.append('images', image);
    });

    if (video) {
      formData.append('video', video);
    }

    try {
      await createComplaint(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      toast.success('Complaint created successfully!');
      setUploadComplete(true);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      toast.error(error.message || 'Failed to create complaint.');
    } finally {
      setLoading(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (index) => {
    setImagesPreviews(prev => prev.filter((_, i) => i !== index));
    setNewlySelectedImages(prev => prev.filter((_, i) => i !== index));
    if (imagesPreviews.length - 1 === 0 && !video) {
      setUploadComplete(false);
    }
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoPreview('');
    if (newlySelectedImages.length === 0) {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-x-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-100/30 to-purple-100/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-gradient-to-tr from-slate-100/40 to-gray-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-6 pt-18 lg:pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative w-full max-w-6xl bg-white/70 backdrop-blur-2xl shadow-2xl shadow-gray-900/10 rounded-3xl lg:rounded-[2rem] border border-white/60 overflow-hidden"
        >
          {/* Enhanced glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-xl rounded-3xl lg:rounded-[2rem]"></div>

          {/* Subtle animated gradient border */}
          <div className="absolute inset-0 rounded-3xl lg:rounded-[2rem] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 p-[1px]">
            <div className="w-full h-full bg-white/70 backdrop-blur-2xl rounded-3xl lg:rounded-[2rem]"></div>
          </div>

          <div className="relative z-10 p-6 sm:p-8 lg:p-12 xl:p-16 space-y-8 lg:space-y-12">
            {/* Enhanced Back Button */}
            <motion.div
              variants={itemVariants}
              className="absolute -top-2 -left-2 sm:top-4 sm:left-4 z-20"
            >
              <motion.button
                onClick={() => navigate('/')}
                className="group relative p-3 sm:p-4 rounded-2xl xl:rounded-3xl text-slate-600 bg-white/80 backdrop-blur-md border border-white/50 transition-all duration-300 shadow-lg shadow-gray-900/5 hover:shadow-xl hover:shadow-blue-500/20"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 rounded-2xl xl:rounded-3xl bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
                <ArrowLeft className="relative w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-blue-600" />
              </motion.button>
            </motion.div>

            {/* Enhanced Header */}
            <motion.div
              variants={itemVariants}
              className="text-center pt-12 sm:pt-16 lg:pt-8 space-y-4 lg:space-y-6"
            >
              <div className="space-y-2">
                <motion.h1
                  className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black bg-gradient-to-br from-slate-900 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight leading-tight"
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  Report New Issue
                </motion.h1>
                <motion.div
                  className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 96, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                ></motion.div>
              </div>
              <motion.p
                className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Submit a complaint with detailed information for swift resolution
              </motion.p>
            </motion.div>

            {/* Enhanced Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-8 lg:space-y-12"
              variants={itemVariants}
            >
              {/* Title and Type Row with enhanced styling */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Enhanced Issue Title */}
                <motion.div
                  className="group space-y-3"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <label className="block text-sm sm:text-base font-bold text-slate-800 tracking-wide">
                    Issue Title <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-5 py-4 lg:py-5 text-base lg:text-lg bg-white/70 backdrop-blur-sm border-2 border-slate-200/60 rounded-2xl xl:rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 text-slate-800 placeholder-slate-500 shadow-sm hover:shadow-lg hover:bg-white/80 group-hover:border-slate-300/80"
                      placeholder="e.g., Leaky pipe in the kitchen"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl xl:rounded-3xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </motion.div>

                {/* Enhanced Issue Type */}
                <motion.div
                  className="group space-y-3"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <label className="block text-sm sm:text-base font-bold text-slate-800 tracking-wide">
                    Issue Type <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full px-5 py-4 lg:py-5 text-base lg:text-lg bg-white/70 backdrop-blur-sm border-2 border-slate-200/60 rounded-2xl xl:rounded-3xl appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 text-slate-800 shadow-sm hover:shadow-lg hover:bg-white/80 group-hover:border-slate-300/80 cursor-pointer"
                    >
                      {complaintTypes.map((complaintType) => (
                        <option key={complaintType} value={complaintType}>
                          {complaintType}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 group-hover:text-slate-700 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                    <div className="absolute inset-0 rounded-2xl xl:rounded-3xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </motion.div>
              </div>

              {/* Enhanced Description */}
              <motion.div
                className="group space-y-3"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <label className="block text-sm sm:text-base font-bold text-slate-800 tracking-wide">
                  Description <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-5 py-4 lg:py-5 text-base lg:text-lg bg-white/70 backdrop-blur-sm border-2 border-slate-200/60 rounded-2xl xl:rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-300 min-h-[120px] lg:min-h-[140px] resize-none text-slate-800 placeholder-slate-500 shadow-sm hover:shadow-lg hover:bg-white/80 group-hover:border-slate-300/80"
                    placeholder="Provide detailed information about the issue..."
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl xl:rounded-3xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </motion.div>

              {/* Enhanced Media Upload Section */}
              <motion.div
                className="space-y-6 lg:space-y-8"
                variants={itemVariants}
              >
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Attach Media</h2>
                  <p className="text-sm text-slate-500 font-medium">Upload images and videos to support your complaint (optional)</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Enhanced Images Upload */}
                  <div className="space-y-4 relative">
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="group w-full p-8 lg:p-10 border-2 border-dashed border-slate-300/60 bg-white/50 backdrop-blur-sm rounded-3xl hover:border-blue-400/80 hover:bg-blue-50/60 transition-all duration-500 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 relative overflow-hidden"
                      disabled={isUploading}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500"></div>
                      <motion.div
                        className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300 relative z-10"
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Image className="w-8 h-8 lg:w-10 lg:h-10 text-slate-500 group-hover:text-blue-600 transition-colors duration-300" />
                      </motion.div>
                      <div className="text-center space-y-2 relative z-10">
                        <span className="text-lg lg:text-xl text-slate-700 font-bold group-hover:text-blue-700 transition-colors duration-300">Upload Images</span>
                        <p className="text-sm text-slate-500 font-medium">PNG, JPG up to 10MB each</p>
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {imagesPreviews.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -20 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute inset-0 bg-white/95 backdrop-blur-lg rounded-3xl p-6 lg:p-8 flex flex-wrap gap-4 overflow-y-auto z-20 border-2 border-slate-200/60 shadow-2xl"
                        >
                          {imagesPreviews.map((preview, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                              animate={{ opacity: 1, scale: 1, rotate: 0 }}
                              exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="relative group w-20 h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                            >
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:bg-red-600 z-10 border-2 border-white"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Enhanced Video Upload */}
                  <div className="space-y-4 relative">
                    <input
                      type="file"
                      ref={videoInputRef}
                      onChange={handleVideoChange}
                      accept="video/*"
                      className="hidden"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="group w-full p-8 lg:p-10 border-2 border-dashed border-slate-300/60 bg-white/50 backdrop-blur-sm rounded-3xl hover:border-blue-400/80 hover:bg-blue-50/60 transition-all duration-500 flex flex-col items-center justify-center gap-4 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 relative overflow-hidden"
                      disabled={isUploading}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500"></div>
                      <motion.div
                        className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300 relative z-10"
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Video className="w-8 h-8 lg:w-10 lg:h-10 text-slate-500 group-hover:text-blue-600 transition-colors duration-300" />
                      </motion.div>
                      <div className="text-center space-y-2 relative z-10">
                        <span className="text-lg lg:text-xl text-slate-700 font-bold group-hover:text-blue-700 transition-colors duration-300">Upload Video</span>
                        <p className="text-sm text-slate-500 font-medium">MP4, MOV up to 50MB</p>
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {videoPreview && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -20 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute inset-0 bg-white/95 backdrop-blur-lg rounded-3xl p-6 lg:p-8 flex items-center justify-center z-20 border-2 border-slate-200/60 shadow-2xl"
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-full h-full group"
                          >
                            <video
                              src={videoPreview}
                              controls
                              className="w-full h-full object-cover rounded-2xl shadow-lg"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={removeVideo}
                              className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10 border-2 border-white"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Enhanced Upload Progress Bar */}
                <AnimatePresence>
                  {(isUploading || uploadComplete) && (newlySelectedImages.length > 0 || !!video) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="p-6 lg:p-8 bg-white/80 backdrop-blur-lg rounded-3xl border-2 border-slate-200/60 shadow-xl"
                    >
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <AnimatePresence mode="wait">
                            {isUploading ? (
                              <motion.div
                                key="loading"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-200/50"
                              >
                                <LoaderCircle className="animate-spin w-6 h-6 text-blue-600" />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="complete"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-200/50"
                              >
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <div className="space-y-1">
                            <AnimatePresence mode="wait">
                              {isUploading ? (
                                <motion.div
                                  key="uploading"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                >
                                  <span className="text-lg font-bold text-slate-800">Uploading...</span>
                                  <p className="text-sm text-slate-600">{uploadProgress}% complete</p>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="complete"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                >
                                  <span className="text-lg font-bold text-green-700">Upload complete!</span>
                                  <p className="text-sm text-green-600">Ready to submit</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        {isUploading && (
                          <div className="w-full sm:w-1/2 bg-slate-200/60 backdrop-blur-sm rounded-full h-3 overflow-hidden shadow-inner">
                            <motion.div
                              className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 h-3 rounded-full shadow-sm"
                              style={{ width: `${uploadProgress}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                            ></motion.div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Enhanced Emergency Warning */}
              <AnimatePresence>
                {type === 'Emergency' && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative overflow-hidden"
                  >
                    <div className="flex items-start gap-5 p-6 lg:p-8 bg-gradient-to-r from-red-50/90 to-orange-50/90 backdrop-blur-lg border-2 border-red-200/60 rounded-3xl shadow-lg relative z-10">
                      <motion.div
                        className="p-3 bg-red-500/15 rounded-2xl flex-shrink-0 border border-red-200/50"
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <AlertTriangle className="w-6 h-6 lg:w-7 lg:h-7 text-red-600" />
                      </motion.div>
                      <div className="space-y-2">
                        <h4 className="text-lg lg:text-xl font-black text-red-800 tracking-tight">Emergency Priority</h4>
                        <p className="text-sm lg:text-base text-red-700 leading-relaxed font-medium">
                          This will be marked as an emergency complaint and will receive priority attention from our team.
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-3xl animate-pulse"></div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced Form Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row justify-end gap-4 lg:gap-6 pt-6"
                variants={itemVariants}
              >
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate('/')}
                  className="group relative px-8 sm:px-10 py-4 lg:py-5 text-base lg:text-lg text-slate-700 bg-white/80 backdrop-blur-md border-2 border-slate-200/60 rounded-2xl xl:rounded-3xl transition-all duration-300 font-bold shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 hover:bg-white/90 hover:border-slate-300/80 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-500/0 to-slate-500/0 group-hover:from-slate-500/5 group-hover:to-slate-500/10 transition-all duration-300"></div>
                  <span className="relative z-10 tracking-wide">Cancel</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="group relative px-8 sm:px-10 py-4 lg:py-5 text-base lg:text-lg bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white rounded-2xl xl:rounded-3xl transition-all duration-300 font-black flex items-center justify-center gap-3 lg:gap-4 shadow-lg shadow-blue-900/25 hover:shadow-xl hover:shadow-blue-900/40 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                  disabled={loading || isUploading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-white/5 transition-all duration-300"></div>
                  <AnimatePresence mode="wait">
                    {(loading || isUploading) ? (
                      <motion.div
                        key="loader"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="relative z-10"
                      >
                        <LoaderCircle className="animate-spin w-5 h-5 lg:w-6 lg:h-6" />
                      </motion.div>
                    ) : uploadComplete ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="relative z-10"
                      >
                        <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="plus"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="relative z-10"
                      >
                        <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="relative z-10 tracking-wide">
                    {loading ? 'Submitting...' : isUploading ? 'Uploading...' : 'Report Issue'}
                  </span>
                </motion.button>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportIssuePage;