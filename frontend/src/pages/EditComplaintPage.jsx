import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, Upload, AlertTriangle, FileText, Image, Video, Plus, ArrowLeft, LoaderCircle, Sparkles, Zap, Shield } from 'lucide-react';

// Optimized floating particles - reduced count and improved animation
const FloatingParticles = React.memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-cyan-400/30 rounded-full will-change-transform"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`
        }}
      />
    ))}
  </div>
));

FloatingParticles.displayName = 'FloatingParticles';

// Memoized complaint types dropdown with holographic effect
const ComplaintTypeSelector = React.memo(({ type, setType, complaintTypes }) => (
  <div className="space-y-4 group">
    <label className="block text-lg font-black tracking-wide">
      <span className="relative inline-block">
        <span className="absolute inset-0 blur-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-50 animate-pulse"></span>
        <span className="relative bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Issue Category
        </span>
      </span>
      <span className="text-red-400 ml-2 text-base">*</span>
    </label>
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
      <div className="relative">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-6 py-5 text-lg bg-slate-900/40 backdrop-blur-2xl border-2 border-cyan-500/20 hover:border-cyan-400/50 focus:border-cyan-400 rounded-3xl focus:outline-none transition-all duration-300 text-slate-100 appearance-none cursor-pointer font-semibold shadow-[0_8px_32px_rgba(6,182,212,0.1)] hover:shadow-[0_8px_32px_rgba(6,182,212,0.2)] focus:shadow-[0_8px_32px_rgba(6,182,212,0.3)] hover:bg-slate-900/60"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(168,85,247,0.05) 100%)'
          }}
        >
          {complaintTypes.map((complaintType) => (
            <option key={complaintType} value={complaintType} className="bg-slate-900 text-white">
              {complaintType}
            </option>
          ))}
        </select>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-400/50 blur-md rounded-full"></div>
            <svg className="relative w-5 h-5 text-cyan-300 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
));

ComplaintTypeSelector.displayName = 'ComplaintTypeSelector';

// Enhanced input field with holographic border
const InputField = React.memo(({ label, value, onChange, placeholder, required = true }) => (
  <div className="space-y-4 group">
    <label className="block text-lg font-black tracking-wide">
      <span className="relative inline-block">
        <span className="absolute inset-0 blur-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-50 animate-pulse"></span>
        <span className="relative bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          {label}
        </span>
      </span>
      <span className={required ? "text-red-400 ml-2 text-base" : "text-slate-500 text-sm ml-2"}>*</span>
    </label>
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="relative w-full px-6 py-5 text-lg bg-slate-900/40 backdrop-blur-2xl border-2 border-cyan-500/20 hover:border-cyan-400/50 focus:border-cyan-400 rounded-3xl focus:outline-none transition-all duration-300 text-slate-100 placeholder-slate-500/60 font-semibold shadow-[0_8px_32px_rgba(6,182,212,0.1)] hover:shadow-[0_8px_32px_rgba(6,182,212,0.2)] focus:shadow-[0_8px_32px_rgba(6,182,212,0.3)] hover:bg-slate-900/60"
        placeholder={placeholder}
        required={required}
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(168,85,247,0.05) 100%)'
        }}
      />
    </div>
  </div>
));

InputField.displayName = 'InputField';

// Enhanced textarea with holographic effect
const TextAreaField = React.memo(({ label, value, onChange, placeholder, required = true }) => (
  <div className="space-y-4 group">
    <label className="block text-lg font-black tracking-wide">
      <span className="relative inline-block">
        <span className="absolute inset-0 blur-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-50 animate-pulse"></span>
        <span className="relative bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          {label}
        </span>
      </span>
      <span className={required ? "text-red-400 ml-2 text-base" : "text-slate-500 text-sm ml-2"}>*</span>
    </label>
    <div className="relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>
      <textarea
        value={value}
        onChange={onChange}
        className="relative w-full px-6 py-5 text-lg bg-slate-900/40 backdrop-blur-2xl border-2 border-cyan-500/20 hover:border-cyan-400/50 focus:border-cyan-400 rounded-3xl focus:outline-none transition-all duration-300 min-h-[160px] resize-none text-slate-100 placeholder-slate-500/60 font-semibold shadow-[0_8px_32px_rgba(6,182,212,0.1)] hover:shadow-[0_8px_32px_rgba(6,182,212,0.2)] focus:shadow-[0_8px_32px_rgba(6,182,212,0.3)] hover:bg-slate-900/60"
        placeholder={placeholder}
        required={required}
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(168,85,247,0.05) 100%)'
        }}
      />
    </div>
  </div>
));

TextAreaField.displayName = 'TextAreaField';

// Optimized image preview - lazy loading and virtualization-ready
const ImagePreviewItem = React.memo(({ preview, index, onRemove }) => (
  <div
    className="relative group will-change-transform"
    style={{
      animation: `scaleIn 0.5s ease-out ${index * 0.05}s both`
    }}
  >
    <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-50 blur-xl transition-all duration-500"></div>
    <div className="relative overflow-hidden rounded-3xl aspect-square shadow-[0_8px_32px_rgba(0,0,0,0.3)] group-hover:shadow-[0_16px_48px_rgba(6,182,212,0.4)] transition-all duration-500 border-2 border-cyan-500/20 group-hover:border-cyan-400/60">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"></div>
      <img
        src={preview}
        alt={`Preview ${index + 1}`}
        loading="lazy"
        className="relative w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 will-change-transform"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
    <button
      type="button"
      onClick={() => onRemove(index)}
      className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-red-500 via-pink-500 to-red-600 hover:from-red-600 hover:via-pink-600 hover:to-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_8px_24px_rgba(239,68,68,0.5)] hover:shadow-[0_12px_32px_rgba(239,68,68,0.7)] hover:scale-110 border-2 border-white/20"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
));

ImagePreviewItem.displayName = 'ImagePreviewItem';

// Revolutionary image preview grid with 3D effects - optimized
const ImagePreviewGrid = React.memo(({ imagesPreviews, onRemove }) => {
  if (imagesPreviews.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
      {imagesPreviews.map((preview, index) => (
        <ImagePreviewItem
          key={`${index}-${preview.substring(0, 20)}`}
          preview={preview}
          index={index}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
});

ImagePreviewGrid.displayName = 'ImagePreviewGrid';

// Futuristic upload progress
const UploadProgress = React.memo(({ isUploading, uploadProgress, uploadComplete }) => {
  if (!isUploading && !uploadComplete) return null;

  return (
    <div className="relative p-8 overflow-hidden rounded-3xl border-2 border-cyan-500/30 shadow-[0_8px_32px_rgba(6,182,212,0.2)]">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-blue-900/40 to-purple-900/60 backdrop-blur-2xl"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg2LDE4MiwyMTIsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

      {isUploading ? (
        <div className="relative space-y-5">
          <div className="flex items-center gap-4 text-lg font-bold text-cyan-300">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"></div>
              <div className="absolute inset-1 bg-cyan-400/20 rounded-full animate-pulse"></div>
            </div>
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              Uploading files... {uploadProgress}%
            </span>
          </div>
          <div className="relative w-full bg-slate-800/50 rounded-full h-3 overflow-hidden shadow-inner border border-cyan-500/20">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden will-change-transform"
              style={{ width: `${uploadProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>
      ) : uploadComplete ? (
        <div className="relative flex items-center gap-4 text-cyan-300 text-lg font-bold">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(6,182,212,0.6)]">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
            Files uploaded successfully!
          </span>
        </div>
      ) : null}
    </div>
  );
});

UploadProgress.displayName = 'UploadProgress';

// Revolutionary emergency alert
const EmergencyAlert = React.memo(({ show }) => {
  if (!show) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-red-500/40 shadow-[0_8px_32px_rgba(239,68,68,0.3)]">
      <div className="absolute inset-0 bg-gradient-to-r from-red-950/60 via-orange-950/40 to-red-950/60 backdrop-blur-2xl"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMzksMzksNjgsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-shimmer"></div>

      <div className="relative flex items-start gap-6 p-8">
        <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-red-500/30 to-orange-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_32px_rgba(239,68,68,0.5)] border-2 border-red-500/30">
          <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-black bg-gradient-to-r from-red-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
            Emergency Issue Alert
          </h4>
          <p className="text-base text-red-200/90 leading-relaxed font-medium">
            This complaint will be flagged as an emergency and will receive immediate priority attention from our support team.
          </p>
        </div>
      </div>
    </div>
  );
});

EmergencyAlert.displayName = 'EmergencyAlert';

// Mock service functions for demo
const getComplaintById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    complaint: {
      title: 'Leaking Pipe in Kitchen',
      description: 'There is a persistent leak under the kitchen sink that has been getting worse over the past week.',
      category: 'Plumbing',
      images: [],
      video: ''
    }
  };
};

const updateComplaint = async (id, formData, progressCallback) => {
  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 100));
    progressCallback({ loaded: i, total: 100 });
  }
  return { success: true };
};

const toast = {
  success: (msg) => console.log('✓', msg),
  error: (msg) => console.error('✗', msg)
};

// Main component
const EditComplaintPage = () => {
  const id = '123';

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

  const complaintTypes = useMemo(() => [
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
  ], []);

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

  const handleImageChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadComplete(false);
    setNewlySelectedImages(prev => [...prev, ...files]);

    // Batch process images
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagesPreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleVideoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadComplete(false);
    setVideo(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(async (e) => {
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

    try {
      await updateComplaint(id, formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      toast.success('Complaint updated successfully!');
      setUploadComplete(true);
      setTimeout(() => {
        console.log('Navigate to home');
      }, 1000);
    } catch (err) {
      toast.error(err.message || 'Failed to update complaint.');
    } finally {
      setSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [title, description, type, newlySelectedImages, video, id]);

  const removeImage = useCallback((indexToRemove) => {
    setImagesPreviews(prev => prev.filter((_, index) => index !== indexToRemove));

    const removedPreview = imagesPreviews[indexToRemove];
    if (removedPreview && !removedPreview.startsWith('https://')) {
      setNewlySelectedImages(prev => {
        const correspondingPreviewIndex = imagesPreviews.filter(p => !p.startsWith('https://')).indexOf(removedPreview);
        return prev.filter((_, i) => i !== correspondingPreviewIndex);
      });
    }
  }, [imagesPreviews]);

  const removeVideo = useCallback(() => {
    setVideo(null);
    setVideoPreview('');
    if (imagesPreviews.length === 0) {
      setUploadComplete(false);
    }
  }, [imagesPreviews]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden flex items-center justify-center p-4">
        <FloatingParticles />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.15),transparent_50%)]"></div>

        <div className="relative z-10 flex flex-col items-center space-y-8">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 border-r-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-transparent border-b-purple-500 border-l-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full animate-pulse"></div>
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              Loading Complaint Details
            </h3>
            <p className="text-slate-400 font-medium">Fetching your information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10 text-center bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-8 shadow-[0_8px_32px_rgba(239,68,68,0.3)] border-2 border-red-500/30 max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500/30">
            <AlertTriangle className="w-12 h-12 text-red-400" />
          </div>
          <h3 className="text-2xl font-black text-red-300 mb-3">Error Loading Complaint</h3>
          <p className="text-red-200/70 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl font-bold transition-all duration-300 hover:shadow-[0_8px_32px_rgba(239,68,68,0.5)] hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          25% { transform: translate3d(10px, -20px, 0); }
          50% { transform: translate3d(-10px, -10px, 0); }
          75% { transform: translate3d(5px, -30px, 0); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .will-change-transform {
          will-change: transform;
        }
      `}</style>

      <FloatingParticles />

      {/* Animated gradient orbs - optimized with will-change */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse will-change-transform"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse will-change-transform" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse will-change-transform" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMTAgNjAgTSAwIDEwIEwgNjAgMTAgTSAyMCAwIEwgMjAgNjAgTSAwIDIwIEwgNjAgMjAgTSAzMCAwIEwgMzAgNjAgTSAwIDMwIEwgNjAgMzAgTSA0MCAwIEwgNDAgNjAgTSAwIDQwIEwgNjAgNDAgTSA1MCAwIEwgNTAgNjAgTSAwIDUwIEwgNjAgNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg2LDE4MiwyMTIsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40 pointer-events-none"></div>

      <div className="relative z-10 flex items-start justify-center p-4 sm:p-6 pt-24 pb-12">
        <div className="w-full max-w-5xl">
          {/* Main futuristic container */}
          <div className="relative">
            {/* Holographic border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-[3rem] opacity-20 blur-2xl"></div>

            <div className="relative bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-2 border-cyan-500/20 overflow-hidden">
              {/* Animated top border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-shimmer"></div>

              {/* Header Section */}
              <div className="relative px-6 sm:px-12 py-10 sm:py-14 bg-gradient-to-r from-slate-900/60 via-blue-900/20 to-purple-900/30 backdrop-blur-xl border-b-2 border-cyan-500/20">
                {/* Back button */}
                <button
                  onClick={() => console.log('Navigate back')}
                  className="absolute left-6 sm:left-12 top-1/2 -translate-y-1/2 w-14 h-14 bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-xl rounded-2xl border-2 border-cyan-500/30 hover:border-cyan-400/60 flex items-center justify-center transition-all duration-300 shadow-[0_8px_24px_rgba(6,182,212,0.2)] hover:shadow-[0_8px_32px_rgba(6,182,212,0.4)] hover:scale-110 group"
                >
                  <ArrowLeft className="w-6 h-6 text-cyan-300 group-hover:text-cyan-200 transition-colors" />
                </button>

                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-50 animate-pulse"></div>
                    <h1 className="relative text-4xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent tracking-tight">
                      Edit Issue
                    </h1>
                  </div>
                  <p className="text-slate-400 text-base sm:text-lg font-semibold tracking-wide">
                    Update your complaint with the latest information
                  </p>
                </div>
              </div>

              {/* Form Content */}
              <div className="px-6 sm:px-12 py-10 sm:py-14">
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Issue Title */}
                  <InputField
                    label="Issue Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Leaky pipe in the kitchen"
                  />

                  {/* Description */}
                  <TextAreaField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed information about the issue, including when it started, location, and any relevant context..."
                  />

                  {/* Issue Type */}
                  <ComplaintTypeSelector
                    type={type}
                    setType={setType}
                    complaintTypes={complaintTypes}
                  />

                  {/* Images Upload */}
                  <div className="space-y-6">
                    <label className="block text-lg font-black tracking-wide">
                      <span className="relative inline-block">
                        <span className="absolute inset-0 blur-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-50 animate-pulse"></span>
                        <span className="relative bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                          Upload Images
                        </span>
                      </span>
                      <span className="text-slate-500 text-base ml-2">(Optional)</span>
                    </label>
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-all duration-700"></div>
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="relative w-full p-12 sm:p-16 border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/60 rounded-3xl transition-all duration-500 flex flex-col items-center justify-center gap-6 backdrop-blur-sm shadow-[0_8px_32px_rgba(6,182,212,0.1)] hover:shadow-[0_16px_48px_rgba(6,182,212,0.2)] hover:bg-slate-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUploading}
                        style={{
                          backgroundImage: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(168,85,247,0.05) 100%)'
                        }}
                      >
                        <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_32px_rgba(6,182,212,0.3)] border-2 border-cyan-500/30">
                          <Image className="w-12 h-12 text-cyan-300" />
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 to-blue-400/20 rounded-3xl group-hover:from-cyan-400/10 group-hover:to-blue-400/30 transition-all duration-500"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl text-slate-200 font-black mb-2 tracking-wide">Click to upload images</p>
                          <p className="text-base text-slate-400 font-semibold">PNG, JPG, GIF up to 10MB each</p>
                        </div>
                      </button>
                    </div>

                    <ImagePreviewGrid imagesPreviews={imagesPreviews} onRemove={removeImage} />

                    <UploadProgress
                      isUploading={isUploading}
                      uploadProgress={uploadProgress}
                      uploadComplete={uploadComplete}
                    />
                  </div>

                  {/* Video Upload */}
                  <div className="space-y-6">
                    <label className="block text-lg font-black tracking-wide">
                      <span className="relative inline-block">
                        <span className="absolute inset-0 blur-xl bg-gradient-to-r from-purple-400 via-pink-500 to-purple-500 opacity-50 animate-pulse"></span>
                        <span className="relative bg-gradient-to-r from-purple-300 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                          Upload Video
                        </span>
                      </span>
                      <span className="text-slate-500 text-base ml-2">(Optional)</span>
                    </label>
                    <input
                      type="file"
                      ref={videoInputRef}
                      onChange={handleVideoChange}
                      accept="video/*"
                      className="hidden"
                    />
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-2xl transition-all duration-700"></div>
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="relative w-full p-12 sm:p-16 border-2 border-dashed border-purple-500/30 hover:border-purple-400/60 rounded-3xl transition-all duration-500 flex flex-col items-center justify-center gap-6 backdrop-blur-sm shadow-[0_8px_32px_rgba(168,85,247,0.1)] hover:shadow-[0_16px_48px_rgba(168,85,247,0.2)] hover:bg-slate-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUploading}
                        style={{
                          backgroundImage: 'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(236,72,153,0.05) 100%)'
                        }}
                      >
                        <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_32px_rgba(168,85,247,0.3)] border-2 border-purple-500/30">
                          <Video className="w-12 h-12 text-purple-300" />
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-pink-400/20 rounded-3xl group-hover:from-purple-400/10 group-hover:to-pink-400/30 transition-all duration-500"></div>
                        </div>
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl text-slate-200 font-black mb-2 tracking-wide">Click to upload video</p>
                          <p className="text-base text-slate-400 font-semibold">MP4, MOV, AVI up to 50MB</p>
                        </div>
                      </button>
                    </div>

                    {videoPreview && (
                      <div className="relative group mt-8">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-3xl opacity-30 blur-xl group-hover:opacity-50 transition-all duration-500"></div>
                        <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 shadow-[0_8px_32px_rgba(168,85,247,0.3)] group-hover:shadow-[0_16px_48px_rgba(168,85,247,0.4)] transition-shadow duration-300 border-2 border-purple-500/30">
                          <video
                            src={videoPreview}
                            controls
                            className="w-full rounded-3xl"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-red-500 via-pink-500 to-red-600 hover:from-red-600 hover:via-pink-600 hover:to-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_8px_24px_rgba(239,68,68,0.5)] hover:shadow-[0_12px_32px_rgba(239,68,68,0.7)] hover:scale-110 border-2 border-white/20"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Emergency Warning */}
                  {type === 'Emergency' && <EmergencyAlert show={true} />}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-5 pt-12">
                    <div className="relative group order-2 sm:order-1">
                      <div className="absolute -inset-1 bg-gradient-to-r from-slate-500 to-slate-600 rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
                      <button
                        type="button"
                        onClick={() => console.log('Cancel')}
                        className="relative w-full sm:w-auto px-10 py-5 text-lg font-black text-slate-200 bg-slate-800/60 hover:bg-slate-800/80 backdrop-blur-xl border-2 border-slate-600/30 hover:border-slate-500/60 rounded-3xl transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:scale-105"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="relative group order-1 sm:order-2">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-50 blur-xl group-hover:opacity-70 transition-all duration-500"></div>
                      <button
                        type="submit"
                        className="relative w-full sm:w-auto px-10 py-5 text-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white rounded-3xl transition-all duration-300 font-black flex items-center justify-center gap-4 shadow-[0_8px_32px_rgba(6,182,212,0.4)] hover:shadow-[0_16px_48px_rgba(6,182,212,0.6)] backdrop-blur-sm border-2 border-white/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none hover:scale-105"
                        disabled={submitting || isUploading}
                      >
                        <div className="flex items-center gap-4">
                          {(submitting || isUploading) ? (
                            <div className="relative w-6 h-6">
                              <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
                              <div className="absolute inset-0 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                            </div>
                          ) : uploadComplete ? (
                            <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <Zap className="w-6 h-6" />
                          )}
                          <span className="font-black tracking-wide">
                            {(submitting || isUploading) ? 'Updating Issue...' : 'Update Issue'}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditComplaintPage;