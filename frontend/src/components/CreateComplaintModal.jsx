import React, { useState, useRef } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';

const CreateComplaintModal = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Normal');
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState('');

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      type,
      images,
      video: video || undefined,
    });
    onClose();
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoPreview('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-box w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Create New Complaint</h2>
            <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">
                <span className="label-text">Complaint Title</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered w-full min-h-[100px]"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Complaint Type</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="select select-bordered w-full"
              >
                <option>Plumbing</option>
                <option>Water Management</option>
                <option>Electricity</option>
                <option>Security</option>
                <option>Waste Management</option>
                <option>Building Structure</option>
                <option>Elevators</option>
                <option>Parking</option>
                <option>Fire Safety</option>
                <option>Financial Issues</option>
                <option>Social Nuisances</option>
                <option value="Emergency">Emergency</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Upload Images</span>
              </label>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="btn btn-outline w-full flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                <span>Click to upload images</span>
              </button>
              {imagesPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagesPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 btn btn-xs btn-circle btn-error"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text">Upload Video</span>
              </label>
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoChange}
                accept="video/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="btn btn-outline w-full flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                <span>Click to upload video</span>
              </button>
              {videoPreview && (
                <div className="mt-4 relative">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute -top-2 -right-2 btn btn-xs btn-circle btn-error"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {type === 'Emergency' && (
              <div className="flex items-start gap-3 p-4 bg-red-100 border border-red-300 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />
                <p className="text-sm text-red-700">
                  This will be marked as an emergency complaint and will receive priority attention.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Submit Complaint
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateComplaintModal;