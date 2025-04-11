import React from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import ThreeDotMenu from './ThreeDotMenu.jsx';
import { statusConfig } from "../constants/complaints.jsx";

const ComplaintCard = ({ complaint, onLike, onView, isEmergency = false }) => (
  <div
    className={`bg-base-100 p-3 sm:p-5 rounded-box shadow-lg flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border ${isEmergency ? 'border-error' : 'border-transparent hover:border-primary'} h-full`}
  >
    <div className="flex-grow">
      <div className="flex justify-between items-start gap-2">
        <h2 className="text-base sm:text-lg font-bold break-words">{complaint.title}</h2>
        <ThreeDotMenu onView={() => onView(complaint)} />
      </div>
      <div className="mt-1 sm:mt-2 flex items-center text-xs sm:text-sm text-base-content/70 flex-wrap gap-1">
        <span className="font-medium truncate">By: {complaint.author}</span>
        <span>•</span>
        <span>{new Date(complaint.date).toLocaleDateString()}</span>
      </div>
      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-base-content/80 line-clamp-3">{complaint.description}</p>
    </div>

    <div className="mt-3 sm:mt-4 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          className={`btn btn-ghost btn-xs sm:btn-sm gap-1 sm:gap-2 ${complaint.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
          onClick={() => onLike(complaint.id)}
        >
          <Heart className="w-4 h-4 sm:w-5 sm:h-5" fill={complaint.isLiked ? "#ef4444" : "none"} />
          <span className="text-xs sm:text-sm">{complaint.likes}</span>
        </button>
        <button className="btn btn-ghost btn-xs sm:btn-sm gap-1 sm:gap-2" onClick={() => onView(complaint)}>
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-xs sm:text-sm">{complaint.comments.length}</span>
        </button>
      </div>
      <span className={`badge badge-xs sm:badge-sm ${statusConfig[complaint.status]?.color || 'badge-neutral'}`}>
        {statusConfig[complaint.status]?.label || complaint.status}
      </span>
    </div>
  </div>
);

export default ComplaintCard;