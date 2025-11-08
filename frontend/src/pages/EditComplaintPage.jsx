import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { X, Upload, AlertTriangle, FileText, Image, Video, Plus, ArrowLeft, LoaderCircle, CheckCircle, Sparkles, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getComplaintById, updateComplaint } from '../lib/complaintService';
import { useParams, useNavigate } from 'react-router-dom';

// Memoized Background Components
const AnimatedBackground = memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated mesh gradient */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 20% 50%, rgba(0, 255, 200, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            willChange: 'background-position',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>

      {/* Holographic grid */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 255, 200, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 255, 200, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            transform: 'perspective(1000px) rotateX(60deg)',
            transformOrigin: 'center center',
            willChange: 'background-position',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '80px 80px'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Dynamic light beams */}
      <motion.div
        className="absolute top-0 left-1/4 w-px h-full opacity-20"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(0, 255, 200, 0.5), transparent)',
          willChange: 'opacity, transform',
        }}
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scaleY: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-0 right-1/3 w-px h-full opacity-20"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(139, 92, 246, 0.5), transparent)',
          willChange: 'opacity, transform',
        }}
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scaleY: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

// Memoized cursor glow
const CursorGlow = memo(({ mousePosition }) => {
  return (
    <motion.div
      className="fixed w-96 h-96 rounded-full pointer-events-none z-0 hidden sm:block"
      style={{
        background: 'radial-gradient(circle, rgba(0, 255, 200, 0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        left: mousePosition.x - 192,
        top: mousePosition.y - 192,
        willChange: 'transform',
      }}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 200,
      }}
    />
  );
});

CursorGlow.displayName = 'CursorGlow';

// Memoized image preview
const ImagePreview = memo(({ preview, index, onRemove }) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{ delay: index * 0.05 }}
      className="relative group/img w-full h-24 sm:h-28 md:h-32 lg:h-36 xl:h-40 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden border border-cyan-500/30 flex items-center justify-center"
    >
      <img src={preview} alt={`Preview ${index + 1}`} className="max-w-full max-h-full object-contain" loading="lazy" />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity" />
      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="absolute xxs:top-1\.5 xxs:right-1\.5 xxs:w-6 xxs:h-6 xs:top-2 xs:right-2 xs:w-7 xs:h-7 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="xxs:w-3 xxs:h-3 xs:w-3\.5 xs:h-3\.5 text-white" />
      </motion.button>
    </motion.div>
  );
});

ImagePreview.displayName = 'ImagePreview';

// New Video Preview Component
const VideoPreview = memo(({ preview, onRemove }) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      className="relative group/video w-full h-24 sm:h-28 md:h-32 lg:h-36 xl:h-40 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden border border-purple-500/30 flex items-center justify-center"
    >
      <video src={preview} controls className="max-w-full max-h-full object-contain" />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/video:opacity-100 transition-opacity" />
      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute xxs:top-1\.5 xxs:right-1\.5 xxs:w-6 xxs:h-6 xs:top-2 xs:right-2 xs:w-7 xs:h-7 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity z-20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="xxs:w-3 xxs:h-3 xs:w-3\.5 xs:h-3\.5 text-white" />
      </motion.button>
    </motion.div>
  );
});

VideoPreview.displayName = 'VideoPreview';

// Memoized feature badge
const FeatureBadge = memo(({ icon: Icon, text, color, delay }) => {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
    >
      <div className={`absolute inset-0 bg-${color}-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-slate-900/40 backdrop-blur-md border border-slate-700/30 rounded-full">
        <Icon className={`w-3 h-3 sm:w-4 sm:h-4 text-${color}-400`} />
        <span className="text-[10px] sm:text-xs font-semibold text-slate-300 whitespace-nowrap">{text}</span>
      </div>
    </motion.div>
  );
});

FeatureBadge.displayName = 'FeatureBadge';

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

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

  // Throttled mouse movement for cursor glow
  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    let rafId;
    let lastTime = 0;
    const throttleDelay = 16;

    const throttledMouseMove = (e) => {
      const currentTime = Date.now();
      if (currentTime - lastTime >= throttleDelay) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          handleMouseMove(e);
          lastTime = currentTime;
        });
      }
    };

    window.addEventListener('mousemove', throttledMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [handleMouseMove]);

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

  const featureBadges = [
    { icon: Zap, text: 'Quick Update', color: 'cyan' },
    { icon: Shield, text: 'Secure Edit', color: 'purple' },
  ];

  if (loading) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden">
        <AnimatedBackground />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            {/* Futuristic Loader */}
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 border-r-purple-500 animate-spin"></div>
              <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-purple-500 border-r-cyan-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-xl animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg animate-pulse shadow-lg shadow-cyan-500/50"></div>
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-center space-y-3">
              <motion.h3
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
              >
                Loading Issue Data
              </motion.h3>
              <p className="text-slate-400 text-base">Retrieving your complaint information...</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-cyan-500 rounded-full"
                ></motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                ></motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-cyan-500 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden">
        <AnimatedBackground />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="relative overflow-hidden rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-red-500/30 p-10 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5"></div>

              <div className="relative z-10 text-center space-y-6">
                <motion.div
                  animate={{ rotate: [0, -5, 5, -5, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/30 blur-2xl rounded-full"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center border border-red-500/30 backdrop-blur-xl">
                      <AlertTriangle className="w-12 h-12 text-red-400" />
                    </div>
                  </div>
                </motion.div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    System Error Detected
                  </h3>
                  <p className="text-red-300/80 text-sm leading-relaxed">{error}</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className="relative group px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-2xl font-bold transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative">Retry Connection</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <AnimatedBackground />
      <CursorGlow mousePosition={mousePosition} />

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-3 sm:px-4 lg:px-8 py-16 sm:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-6xl"
        >
          {/* Futuristic card container */}
          <div className="relative">
            {/* Animated border glow */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl sm:rounded-3xl lg:rounded-[32px] opacity-75"
              style={{
                background: 'linear-gradient(90deg, #00ffc8, #8b5cf6, #00ffc8)',
                backgroundSize: '200% 100%',
                willChange: 'background-position',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '200% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Main card */}
            <div className="relative bg-slate-950/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl lg:rounded-[32px] overflow-hidden border border-cyan-500/20">
              {/* Holographic overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />

              <div className="relative z-10 p-4 sm:p-6 lg:p-10 xl:p-14 space-y-5 sm:space-y-7 lg:space-y-9">
                {/* Back button */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.button
                    onClick={() => navigate('/')}
                    className="group relative px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-xl sm:rounded-2xl overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-slate-800/40 backdrop-blur-sm" />
                    <div className="relative flex items-center gap-1.5 sm:gap-2 text-cyan-400 font-semibold text-xs sm:text-sm lg:text-base">
                      <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 transition-transform group-hover:-translate-x-1" />
                      <span>Back</span>
                    </div>
                    <div className="absolute inset-0 border border-cyan-500/30 rounded-xl sm:rounded-2xl" />
                  </motion.button>
                </motion.div>

                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-center space-y-3 sm:space-y-4 lg:space-y-5"
                >
                  <div className="relative inline-block">
                    <motion.h1
                      className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black relative px-4 sm:px-0"
                      style={{
                        background: 'linear-gradient(135deg, #00ffc8 0%, #8b5cf6 50%, #00ffc8 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 0 80px rgba(0, 255, 200, 0.3)',
                      }}
                    >
                      Edit Issue
                    </motion.h1>

                    {/* Floating icons */}
                    <motion.div
                      className="absolute -right-6 sm:-right-10 lg:-right-12 top-0 hidden sm:block"
                      style={{ willChange: 'transform' }}
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    >
                      <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-cyan-400" />
                    </motion.div>
                    <motion.div
                      className="absolute -left-6 sm:-left-10 lg:-left-12 bottom-0 hidden sm:block"
                      style={{ willChange: 'transform' }}
                      animate={{
                        y: [0, 10, 0],
                        rotate: [0, -10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: 1,
                      }}
                    >
                      <Zap className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-400" />
                    </motion.div>
                  </div>

                  <motion.div
                    className="flex items-center justify-center gap-2"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    <div className="h-px w-12 sm:w-20 lg:w-24 bg-gradient-to-r from-transparent to-cyan-500" />
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-cyan-400" />
                    <div className="h-px w-12 sm:w-20 lg:w-24 bg-gradient-to-l from-transparent to-purple-500" />
                  </motion.div>

                  <motion.p
                    className="text-xs sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto px-2 sm:px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Update your complaint with the latest information
                  </motion.p>
                </motion.div>

                {/* Form */}
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-6 lg:space-y-7"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {/* Title and Type */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
                    {/* Title */}
                    <motion.div
                      className="space-y-2 sm:space-y-2.5"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm font-bold text-cyan-400 tracking-wider uppercase">
                        <div className="w-0.5 sm:w-1 h-3 sm:h-3.5 lg:h-4 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full" />
                        Issue Title
                        <span className="text-[10px] sm:text-xs text-red-400">*</span>
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 bg-slate-900/50 backdrop-blur-md border border-cyan-500/20 rounded-lg sm:rounded-xl lg:rounded-2xl focus:outline-none focus:border-cyan-400/60 focus:bg-slate-900/70 transition-all duration-300 text-white placeholder-slate-500 text-xs sm:text-sm lg:text-base"
                          placeholder="Enter issue title..."
                          required
                        />
                        <div className="absolute inset-0 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    </motion.div>

                    {/* Type */}
                    <motion.div
                      className="space-y-2 sm:space-y-2.5"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm font-bold text-purple-400 tracking-wider uppercase">
                        <div className="w-0.5 sm:w-1 h-3 sm:h-3.5 lg:h-4 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full" />
                        Issue Type
                        <span className="text-[10px] sm:text-xs text-red-400">*</span>
                      </label>
                      <div className="relative group">
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 bg-slate-900/50 backdrop-blur-md border border-purple-500/20 rounded-lg sm:rounded-xl lg:rounded-2xl focus:outline-none focus:border-purple-400/60 focus:bg-slate-900/70 transition-all duration-300 text-white appearance-none cursor-pointer text-xs sm:text-sm lg:text-base"
                        >
                          {complaintTypes.map((ct) => (
                            <option key={ct} value={ct} className="bg-slate-900">
                              {ct}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-2.5 sm:right-3 lg:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <motion.svg
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ willChange: 'transform' }}
                            animate={{ y: [0, 3, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                          </motion.svg>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Description */}
                  <motion.div
                    className="space-y-2 sm:space-y-2.5"
                    whileHover={{ scale: 1.005 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm font-bold text-cyan-400 tracking-wider uppercase">
                      <div className="w-0.5 sm:w-1 h-3 sm:h-3.5 lg:h-4 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full" />
                      Description
                      <span className="text-[10px] sm:text-xs text-red-400">*</span>
                    </label>
                    <div className="relative group">
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-3.5 bg-slate-900/50 backdrop-blur-md border border-cyan-500/20 rounded-lg sm:rounded-xl lg:rounded-2xl focus:outline-none focus:border-cyan-400/60 focus:bg-slate-900/70 transition-all duration-300 min-h-[120px] sm:min-h-[140px] lg:min-h-[160px] resize-none text-white placeholder-slate-500 text-xs sm:text-sm lg:text-base"
                        placeholder="Describe the issue in detail..."
                        required
                      />
                      <div className="absolute inset-0 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-cyan-500/0 via-cyan-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  </motion.div>

                  {/* Media Upload */}
                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <motion.div
                        className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1 }}
                      />
                      <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-400 tracking-wider uppercase whitespace-nowrap">Attach Media</span>
                      <motion.div
                        className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1 }}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                      {/* Images */}
                      <div className="relative">
                        <input
                          type="file"
                          ref={imageInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={isUploading}
                        />
                        <motion.button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="relative w-full h-36 sm:h-44 lg:h-48 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isUploading}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-sm" />
                          <div className="absolute inset-0 border-2 border-dashed border-cyan-500/30 rounded-lg sm:rounded-xl lg:rounded-2xl group-hover:border-cyan-400/60 transition-colors" />

                          <div className="relative h-full flex flex-col items-center justify-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 lg:p-6">
                            <motion.div
                              className="p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30"
                              whileHover={{ rotate: [0, -10, 10, 0] }}
                              transition={{ duration: 0.5 }}
                            >
                              <Image className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-cyan-400" />
                            </motion.div>
                            <div className="text-center">
                              <p className="text-sm sm:text-base lg:text-lg font-bold text-cyan-400 mb-0.5 sm:mb-1">Upload Images</p>
                              <p className="text-[10px] sm:text-xs text-slate-500">PNG, JPG • Max 10MB</p>
                            </div>
                          </div>

                          <AnimatePresence>
                            {imagesPreviews.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl p-2 sm:p-3 lg:p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-2 overflow-y-auto"
                              >
                                {imagesPreviews.map((preview, index) => (
                                  <ImagePreview
                                    key={index}
                                    preview={preview}
                                    index={index}
                                    onRemove={removeImage}
                                  />
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>

                      {/* Video */}
                      <div className="relative">
                        <input
                          type="file"
                          ref={videoInputRef}
                          onChange={handleVideoChange}
                          accept="video/*"
                          className="hidden"
                          disabled={isUploading}
                        />
                        <motion.button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="relative w-full h-36 sm:h-44 lg:h-48 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isUploading}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 backdrop-blur-sm" />
                          <div className="absolute inset-0 border-2 border-dashed border-purple-500/30 rounded-lg sm:rounded-xl lg:rounded-2xl group-hover:border-purple-400/60 transition-colors" />

                          <div className="relative h-full flex flex-col items-center justify-center gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 lg:p-6">
                            <motion.div
                              className="p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30"
                              whileHover={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 0.5 }}
                            >
                              <Video className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-purple-400" />
                            </motion.div>
                            <div className="text-center">
                              <p className="text-sm sm:text-base lg:text-lg font-bold text-purple-400 mb-0.5 sm:mb-1">Upload Video</p>
                              <p className="text-[10px] sm:text-xs text-slate-500">MP4, MOV • Max 50MB</p>
                            </div>
                          </div>

                          <AnimatePresence>
                            {videoPreview && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl p-2 sm:p-3 lg:p-4 flex items-center justify-center"
                              >
                                <VideoPreview preview={videoPreview} onRemove={removeVideo} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </div>

                    {/* Upload Progress */}
                    <AnimatePresence>
                      {(isUploading || uploadComplete) && (newlySelectedImages.length > 0 || !!video || imagesPreviews.filter(img => img.startsWith && img.startsWith('https://')).length > 0) && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-xl" />
                          <div className="absolute inset-0 border border-cyan-500/20 rounded-lg sm:rounded-xl lg:rounded-2xl" />

                          <div className="relative p-3 sm:p-4 lg:p-5 flex items-center gap-2.5 sm:gap-3 lg:gap-4">
                            <AnimatePresence mode="wait">
                              {isUploading ? (
                                <motion.div
                                  key="loading"
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0, rotate: 180 }}
                                  className="relative"
                                >
                                  <div className="absolute inset-0 bg-cyan-400/20 rounded-lg sm:rounded-xl blur-xl" />
                                  <div className="relative p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-cyan-500/30 to-cyan-600/20 rounded-lg sm:rounded-xl border border-cyan-500/40">
                                    <LoaderCircle className="animate-spin w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-cyan-400" />
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="complete"
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0, rotate: 180 }}
                                  className="relative"
                                >
                                  <div className="absolute inset-0 bg-green-400/20 rounded-lg sm:rounded-xl blur-xl" />
                                  <div className="relative p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-lg sm:rounded-xl border border-green-500/40">
                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-400" />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="flex-1 min-w-0">
                              <AnimatePresence mode="wait">
                                {isUploading ? (
                                  <motion.div
                                    key="uploading"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-1 sm:space-y-1.5 lg:space-y-2"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-white font-bold text-xs sm:text-sm lg:text-base truncate">Uploading Media</span>
                                      <span className="text-cyan-400 font-mono text-[10px] sm:text-xs lg:text-sm ml-2">{uploadProgress}%</span>
                                    </div>
                                    <div className="relative h-1.5 sm:h-2 bg-slate-800/50 rounded-full overflow-hidden">
                                      <motion.div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-full"
                                        style={{ width: `${uploadProgress}%`, willChange: 'width' }}
                                        transition={{ duration: 0.3 }}
                                      />
                                      <motion.div
                                        className="absolute inset-y-0 left-0 bg-white/30 rounded-full blur-sm"
                                        style={{ width: `${uploadProgress}%`, willChange: 'width' }}
                                        transition={{ duration: 0.3 }}
                                      />
                                    </div>
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="complete"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                  >
                                    <span className="text-green-400 font-bold text-xs sm:text-sm lg:text-base">Upload Complete</span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Emergency Alert */}
                  <AnimatePresence>
                    {type === 'Emergency' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20"
                          style={{
                            backgroundSize: '200% 100%',
                            willChange: 'background-position',
                          }}
                          animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                          }}
                        />

                        <div className="absolute inset-0 border-2 border-red-500/40 rounded-lg sm:rounded-xl lg:rounded-2xl" />

                        <div className="relative flex items-start gap-2.5 sm:gap-3 lg:gap-4 p-3 sm:p-4 lg:p-5 backdrop-blur-xl">
                          <motion.div
                            className="relative flex-shrink-0"
                            style={{ willChange: 'transform' }}
                            animate={{
                              rotate: [0, -10, 10, -10, 0],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1,
                            }}
                          >
                            <div className="absolute inset-0 bg-red-400/30 rounded-lg sm:rounded-xl blur-xl" />
                            <div className="relative p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-red-500/30 to-orange-500/20 rounded-lg sm:rounded-xl border border-red-500/40">
                              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-400" />
                            </div>
                          </motion.div>

                          <div className="flex-1 space-y-1 sm:space-y-1.5 min-w-0">
                            <h4 className="text-sm sm:text-base lg:text-lg font-bold text-red-300 flex items-center gap-1.5 sm:gap-2">
                              <span className="truncate">Emergency Priority Activated</span>
                              <motion.span
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-400 rounded-full flex-shrink-0"
                              />
                            </h4>
                            <p className="text-[10px] sm:text-xs lg:text-sm text-red-200/80 leading-relaxed">
                              This issue will receive immediate priority attention from our support team.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <motion.div
                    className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 lg:gap-4 pt-4 sm:pt-6 lg:pt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      type="button"
                      onClick={() => navigate('/')}
                      className="relative flex-1 sm:flex-none px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3.5 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold text-slate-300 overflow-hidden group text-xs sm:text-sm lg:text-base"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-slate-800/40 backdrop-blur-sm" />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-500/0 via-slate-500/20 to-slate-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 border border-slate-700/50 rounded-lg sm:rounded-xl lg:rounded-2xl" />
                      <span className="relative z-10">Cancel</span>
                    </motion.button>

                    <motion.button
                      type="submit"
                      className="relative flex-1 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-3.5 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold overflow-hidden group text-xs sm:text-sm lg:text-base"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={submitting || isUploading}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-cyan-600"
                        style={{
                          backgroundSize: '200% 100%',
                          willChange: 'background-position',
                        }}
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/30 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                      <div className="absolute inset-0 border border-cyan-400/30 rounded-lg sm:rounded-xl lg:rounded-2xl" />

                      <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-3 text-white">
                        <AnimatePresence mode="wait">
                          {submitting || isUploading ? (
                            <motion.div
                              key="loader"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                            >
                              <LoaderCircle className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                            </motion.div>
                          ) : uploadComplete ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                            >
                              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="plus"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                            >
                              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <span className="font-bold text-sm sm:text-base lg:text-lg">
                          {submitting ? 'Processing...' : isUploading ? 'Uploading...' : 'Update Issue'}
                        </span>
                      </div>
                    </motion.button>
                  </motion.div>
                </motion.form>
              </div>
            </div>
          </div>

          {/* Floating feature badges */}
          <motion.div
            className="mt-4 sm:mt-6 lg:mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {featureBadges.map((badge, i) => (
              <FeatureBadge
                key={badge.text}
                icon={badge.icon}
                text={badge.text}
                color={badge.color}
                delay={0.9 + i * 0.1}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
      <style jsx>{`
        /* Custom breakpoint for extra small devices (320px) */
        @media (min-width: 320px) {
          .xxs\:w-20 { width: 5rem; }
          .xxs\:h-20 { height: 5rem; }
          .xxs\:w-2\.5 { width: 0.625rem; }
          .xxs\:h-2\.5 { height: 0.625rem; }
          .xxs\:top-0\.5 { top: 0.125rem; }
          .xxs\:right-0\.5 { right: 0.125rem; }
          .xxs\:rounded-md { border-radius: 0.375rem; }
          .xxs\:w-6 { width: 1.5rem; }
          .xxs\:h-6 { height: 1.5rem; }
          .xxs\:top-1\.5 { top: 0.375rem; }
          .xxs\:right-1\.5 { right: 0.375rem; }
          .xxs\:w-3 { width: 0.75rem; }
          .xxs\:h-3 { height: 0.75rem; }
          .xxs\:text-sm { font-size: 0.875rem; }
        }

        /* Custom breakpoint for small devices (375px) */
        @media (min-width: 375px) {
          .xs\:w-20 { width: 5rem; }
          .xs\:h-20 { height: 5rem; }
          .xs\:w-2\.5 { width: 0.625rem; }
          .xs\:h-2\.5 { height: 0.625rem; }
          .xs\:top-0\.5 { top: 0.125rem; }
          .xs\:right-0\.5 { right: 0.125rem; }
          .xs\:rounded-md { border-radius: 0.375rem; }
          .xs\:w-7 { width: 1.75rem; }
          .xs\:h-7 { height: 1.75rem; }
          .xs\:top-2 { top: 0.5rem; }
          .xs\:right-2 { right: 0.5rem; }
          .xs\:w-3\.5 { width: 0.875rem; }
          .xs\:h-3\.5 { height: 0.875rem; }
          .xs\:text-base { font-size: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default EditComplaintPage;