import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, AlertTriangle, FileText, Image, Video, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CreateComplaintModal = ({ onClose, onSubmit, initialComplaint = null, isEditing = false }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Plumbing');
  const [newlySelectedImages, setNewlySelectedImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    if (initialComplaint) {
      setTitle(initialComplaint.title || '');
      setDescription(initialComplaint.description || '');
      setType(initialComplaint.category || 'Plumbing');
      // Initialize imagesPreviews with existing image URLs when editing
      setImagesPreviews(initialComplaint.images || []); // Assuming initialComplaint.images are already URLs
      setVideoPreview(initialComplaint.video || ''); // Assuming initialComplaint.video is a URL
      setNewlySelectedImages([]); // Clear any new files when initializing for edit
    }
  }, [initialComplaint]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
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

    if (video) {
      setIsUploadingVideo(true);
    }

    const complaintData = {
      title,
      description,
      category: type, // Changed 'type' to 'category' to match backend schema
      // Only send imagesPreviews. The backend will handle distinguishing URLs from base64.
      images: imagesPreviews, // This now contains both existing URLs and new base64 previews
      video: video || undefined,
    };

    console.log("Submitting complaint data:", complaintData);

    try {
      if (isEditing && initialComplaint) {
        await onSubmit({
          _id: initialComplaint._id,
          ...complaintData,
        });
      } else {
        await onSubmit(complaintData);
      }
      onClose();
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error("Failed to submit complaint. Please try again.");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const removeImage = (index) => {
    // This logic needs to differentiate between existing URLs and newly added file previews
    // For now, we simply remove from previews. Backend will handle if it's an existing URL.
    setImagesPreviews(prev => prev.filter((_, i) => i !== index));
    // If the removed item was a newly selected file, also remove it from setNewlySelectedImages
    // This part is tricky as there's no direct mapping from preview to original file object by index easily
    // For simplicity, we might reset newlySelectedImages if an existing preview is removed or handle this more robustly.
    // For now, let's assume newlySelectedImages will be re-evaluated on submit, or handle more explicitly.
    const removedPreview = imagesPreviews[index];
    if (removedPreview && removedPreview.startsWith && removedPreview.startsWith('data:')) {
      // It's a base64 string, so it corresponds to a newly selected file
      // Finding the exact file by index in `newlySelectedImages` is hard. Resetting for now.
      setNewlySelectedImages([]); // This might be too aggressive, but ensures no stale files.
    }
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoPreview('');
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start z-[100] px-4 pt-[80px] pb-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[calc(100vh - 100px)] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-gray-200/50 bg-white flex-shrink-0">
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate">{isEditing ? 'Edit Issue' : 'Report New Issue'}</h2>
                  <p className="text-sm text-gray-500 hidden sm:block">Help improve our community</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
                onClick={onClose}
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-4 md:p-6 flex-grow overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Issue Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Issue Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-base border border-gray-200 rounded-lgfocus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
                  placeholder="e.g., Leaky pipe in the kitchen"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-h-[100px] resize-none text-gray-900"
                  placeholder="Provide detailed information about the issue..."
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Issue Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2.5 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
                >
                  {complaintTypes.map((complaintType) => (
                    <option key={complaintType} value={complaintType}>
                      {complaintType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Images Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Upload Images
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Image className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 font-medium">Click to upload images</span>
                </motion.button>

                {imagesPreviews.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"
                  >
                    {imagesPreviews.map((preview, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="w-3 h-3" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Upload Video (Optional)
                </label>
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoChange}
                  accept="video/*"
                  className="hidden"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Video className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 font-medium">Click to upload video</span>
                </motion.button>

                {isUploadingVideo && (
                  <div className="mt-2 flex items-center gap-2 text-blue-600 animate-pulse">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Uploading video...</span>
                  </div>
                )}

                {videoPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 relative group"
                  >
                    <video
                      src={videoPreview}
                      controls
                      className="w-full rounded-lg"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={removeVideo}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                  </motion.div>
                )}
              </div>

              {/* Emergency Warning */}
              {type === 'Emergency' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 leading-relaxed">
                    This will be marked as an emergency complaint and will receive priority attention.
                  </p>
                </motion.div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 border-t border-gray-200/50 bg-white flex-shrink-0">
            <div className="flex flex-col sm:flex-row-reverse gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                onClick={handleSubmit}
                className="w-full sm:w-auto px-6 py-3 text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{isEditing ? 'Update Issue' : 'Submit Issue'}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 text-base text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateComplaintModal;