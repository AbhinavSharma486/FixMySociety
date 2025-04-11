import React, { useState } from 'react';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintModal from '../components/ComplaintModal';
import CreateComplaintModal from '../components/CreateComplaintModal';
import { initialComplaints } from '../constants/complaints';

const MainPage = () => {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLike = (id) => {
    setComplaints(prevComplaints =>
      prevComplaints.map(c =>
        c.id === id ? {
          ...c,
          isLiked: !c.isLiked,
          likes: c.isLiked ? c.likes - 1 : c.likes + 1
        } : c
      )
    );

    if (selectedComplaint?.id === id) {
      setSelectedComplaint(prev => ({
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
      }));
    }
  };

  const handleAddComment = (id, text) => {
    setComplaints(complaints.map(c =>
      c.id === id ? {
        ...c,
        comments: [...c.comments, {
          id: Date.now(),
          author: 'Current User',
          text,
          date: new Date()
        }]
      } : c
    ));
  };

  const handleCreateComplaint = (complaintData) => {
    const newComplaint = {
      id: Date.now(),
      title: complaintData.title,
      description: complaintData.description,
      status: complaintData.type === 'Emergency' ? 'Urgent' : 'Pending',
      date: new Date(),
      author: 'Current User',
      likes: 0,
      isLiked: false,
      comments: [],
      images: complaintData.images.map(file => URL.createObjectURL(file)),
      video: complaintData.video ? URL.createObjectURL(complaintData.video) : undefined,
    };

    setComplaints(prev => [newComplaint, ...prev]);
  };

  // Sort all complaints by date (newest first)
  const sortedComplaints = [...complaints].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Separate emergency and regular complaints
  const emergencyComplaints = sortedComplaints.filter(c => c.status === "Urgent");
  const regularComplaints = sortedComplaints.filter(c => c.status !== "Urgent");

  // The newest emergency complaint (if exists) will be shown in the emergency slot
  const primaryEmergencyComplaint = emergencyComplaints.length > 0 ? emergencyComplaints[0] : null;

  // Other emergency complaints will be merged with regular complaints at the beginning
  const otherEmergencyComplaints = emergencyComplaints.slice(1);
  const allRegularComplaints = [...otherEmergencyComplaints, ...regularComplaints];

  return (
    <div className="min-h-screen bg-base-200 p-2 sm:p-4 md:p-6 lg:p-8 mt-15">
      {showModal && selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setShowModal(false)}
          onLike={handleLike}
          onAddComment={handleAddComment}
        />
      )}

      {showCreateModal && (
        <CreateComplaintModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateComplaint}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Top Section: Create Button + Emergency Complaint */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
          {/* Create Complaint Button */}
          <div className="col-span-1">
            <div className="bg-base-100 p-3 sm:p-5 rounded-box shadow-lg hover:shadow-xl border border-transparent hover:border-primary/20 h-full flex items-center justify-center min-h-[120px] sm:min-h-[200px]">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-sm sm:btn-md w-full h-full gap-1 sm:gap-2 flex flex-row items-center justify-center text-sm sm:text-lg hover:scale-[1.02] transition-transform gradient-btn rounded-tl-4xl rounded-br-4xl"
              >
                <PlusCircle className="w-4 h-4 text-white sm:w-6 sm:h-6" />
                <span className='text-white'>Create Complaint</span>
              </button>
            </div>
          </div>

          {/* Emergency Complaint Container */}
          {primaryEmergencyComplaint && (
            <div className="col-span-1 lg:col-span-2">
              <div className="bg-gradient-to-r from-error/10 to-error/20 p-3 sm:p-6 rounded-box drop-shadow-xl border border-error/30 h-full min-h-[120px] sm:min-h-[200px] flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2 sm:mb-4">
                  <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-error" />
                  <h2 className="text-base sm:text-xl font-bold">Emergency</h2>
                </div>
                <ComplaintCard
                  complaint={primaryEmergencyComplaint}
                  onLike={handleLike}
                  onView={(c) => {
                    setSelectedComplaint(c);
                    setShowModal(true);
                  }}
                  isEmergency
                />
              </div>
            </div>
          )}
        </div>

        {/* Regular Complaints Grid */}
        {allRegularComplaints.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {allRegularComplaints.map(c => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                onLike={handleLike}
                onView={(c) => {
                  setSelectedComplaint(c);
                  setShowModal(true);
                }}
                isEmergency={c.status === "Urgent"}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-base-content/70 text-xs sm:text-sm mt-2 sm:mt-4">No complaints to show.</p>
        )}
      </div>
    </div>
  );
};

export default MainPage;