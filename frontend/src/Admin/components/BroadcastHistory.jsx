import React, { useState, useMemo, useCallback } from 'react';
import { Trash2, Radio, Building2, Clock, AlertTriangle } from 'lucide-react';
import toastManager from '../../lib/toastManager';

const BroadcastHistory = ({ broadcasts, deleteBroadcast }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Memoize broadcast count to prevent recalculation
  const broadcastCount = useMemo(() => broadcasts?.length || 0, [broadcasts]);

  // Optimize callbacks with useCallback to prevent re-renders
  const requestDelete = useCallback((id) => {
    setConfirmId(id);
    setShowConfirm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!confirmId) return;
    try {
      setDeletingId(confirmId);
      await deleteBroadcast(confirmId);
    } catch (error) {
      toastManager.showError(`broadcast:delete:${confirmId}`, error?.message || 'Failed to delete broadcast.');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
      setShowConfirm(false);
    }
  }, [confirmId, deleteBroadcast]);

  const cancelDelete = useCallback(() => {
    setConfirmId(null);
    setShowConfirm(false);
  }, []);

  const handleMouseEnter = useCallback((id) => {
    setHoveredRow(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredRow(null);
  }, []);

  // Memoize formatted dates to avoid recalculating on every render
  const formattedBroadcasts = useMemo(() => {
    if (!broadcasts) return [];
    return broadcasts.map(broadcast => ({
      ...broadcast,
      formattedDate: new Date(broadcast.createdAt).toLocaleString(),
      targetName: broadcast.relatedBuilding ? broadcast.relatedBuilding.buildingName : 'All Buildings'
    }));
  }, [broadcasts]);

  if (!broadcasts || broadcastCount === 0) {
    return (
      <div className="relative mt-4 sm:mt-6 md:mt-8 group px-2 sm:px-0">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000" style={{ willChange: 'opacity' }}></div>
        <div className="relative backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
              <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Broadcast History
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 md:py-16 space-y-3 sm:space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative p-4 sm:p-6 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/10">
                <Radio className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-purple-400" />
              </div>
            </div>
            <p className="text-gray-400 text-center text-base sm:text-lg font-light px-4">No broadcasts have been sent yet.</p>
            <p className="text-gray-500 text-xs sm:text-sm text-center max-w-md px-4">Start broadcasting messages to your audience and they'll appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative mt-4 sm:mt-6 md:mt-8 group px-2 sm:px-0">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000" style={{ willChange: 'opacity' }}></div>
        <div className="relative backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl -z-10" style={{ willChange: 'transform' }}></div>

          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 flex-shrink-0">
                <Radio className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-400" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent truncate">
                Broadcast History
              </h2>
            </div>
            <div className="w-full xs:w-auto xs:ml-auto px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 flex-shrink-0">
              <span className="text-xs sm:text-sm font-semibold text-purple-300 whitespace-nowrap">{broadcastCount} total</span>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-b border-white/10">
                    <th className="px-4 xl:px-6 py-3 xl:py-4 text-left">
                      <span className="text-xs xl:text-sm font-semibold text-purple-300 uppercase tracking-wider">Message</span>
                    </th>
                    <th className="px-4 xl:px-6 py-3 xl:py-4 text-left">
                      <span className="text-xs xl:text-sm font-semibold text-purple-300 uppercase tracking-wider">Target</span>
                    </th>
                    <th className="px-4 xl:px-6 py-3 xl:py-4 text-left">
                      <span className="text-xs xl:text-sm font-semibold text-purple-300 uppercase tracking-wider">Sent At</span>
                    </th>
                    <th className="px-4 xl:px-6 py-3 xl:py-4 text-right">
                      <span className="text-xs xl:text-sm font-semibold text-purple-300 uppercase tracking-wider">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {formattedBroadcasts.map((broadcast, index) => (
                    <BroadcastRow
                      key={broadcast._id}
                      broadcast={broadcast}
                      index={index}
                      hoveredRow={hoveredRow}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      onDelete={requestDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3 sm:space-y-4">
            {formattedBroadcasts.map((broadcast, index) => (
              <BroadcastCard
                key={broadcast._id}
                broadcast={broadcast}
                index={index}
                onDelete={requestDelete}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmationModal
          deletingId={deletingId}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale3d(0.9, 0.9, 1);
          }
          to {
            opacity: 1;
            transform: scale3d(1, 1, 1);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (min-width: 400px) {
          .xs\:flex-row {
            flex-direction: row;
          }
          .xs\:items-center {
            align-items: center;
          }
          .xs\:gap-3 {
            gap: 0.75rem;
          }
          .xs\:w-auto {
            width: auto;
          }
          .xs\:ml-auto {
            margin-left: auto;
          }
        }
      `}</style>
    </>
  );
};

// Memoized row component to prevent unnecessary re-renders
const BroadcastRow = React.memo(({ broadcast, index, hoveredRow, onMouseEnter, onMouseLeave, onDelete }) => {
  const isHovered = hoveredRow === broadcast._id;

  return (
    <tr
      onMouseEnter={() => onMouseEnter(broadcast._id)}
      onMouseLeave={onMouseLeave}
      className="group/row transition-all duration-300 hover:bg-white/5"
      style={{
        animation: `fadeSlideIn 0.5s ease-out ${index * 0.1}s both`,
        willChange: 'background-color'
      }}
    >
      <td className="px-4 xl:px-6 py-3 xl:py-4">
        <div className="flex items-start gap-2 xl:gap-3">
          <div
            className="mt-1 p-1.5 xl:p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10 transition-transform duration-300 flex-shrink-0"
            style={{
              transform: isHovered ? 'scale3d(1.1, 1.1, 1)' : 'scale3d(1, 1, 1)',
              willChange: 'transform'
            }}
          >
            <Radio className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm xl:text-base text-gray-100 font-medium line-clamp-2 group-hover/row:text-white transition-colors">
              {broadcast.message}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 xl:px-6 py-3 xl:py-4">
        <div className="flex items-center gap-1.5 xl:gap-2 min-w-0">
          <div className="p-1 xl:p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm flex-shrink-0">
            <Building2 className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-purple-400" />
          </div>
          <span className="text-sm xl:text-base text-gray-300 font-medium truncate">
            {broadcast.targetName}
          </span>
        </div>
      </td>
      <td className="px-4 xl:px-6 py-3 xl:py-4">
        <div className="flex items-center gap-1.5 xl:gap-2 min-w-0">
          <Clock className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-gray-400 flex-shrink-0" />
          <span className="text-xs xl:text-sm text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
            {broadcast.formattedDate}
          </span>
        </div>
      </td>
      <td className="px-4 xl:px-6 py-3 xl:py-4 text-right">
        <button
          onClick={() => onDelete(broadcast._id)}
          className="inline-flex items-center gap-1.5 xl:gap-2 px-3 py-1.5 xl:px-4 xl:py-2 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 text-xs xl:text-sm"
          style={{ willChange: 'transform' }}
        >
          <Trash2 className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
          <span className="hidden xl:inline">Delete</span>
        </button>
      </td>
    </tr>
  );
});

BroadcastRow.displayName = 'BroadcastRow';

// Memoized card component for mobile view
const BroadcastCard = React.memo(({ broadcast, index, onDelete }) => {
  return (
    <div
      className="relative group/card"
      style={{
        animation: `fadeSlideIn 0.5s ease-out ${index * 0.1}s both`
      }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl blur opacity-0 group-hover/card:opacity-20 transition duration-500" style={{ willChange: 'opacity' }}></div>
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-300">
        <div className="flex items-start gap-2 sm:gap-3 mb-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10 flex-shrink-0">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base text-gray-100 font-medium mb-2 line-clamp-3 break-words">
              {broadcast.message}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
            <div className="p-1 sm:p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex-shrink-0">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
            </div>
            <span className="text-gray-300 truncate">
              {broadcast.targetName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-400 break-all">
              {broadcast.formattedDate}
            </span>
          </div>
        </div>

        <button
          onClick={() => onDelete(broadcast._id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 font-medium transition-all duration-300 hover:scale-[1.02] text-xs sm:text-sm"
          style={{ willChange: 'transform' }}
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Delete Broadcast
        </button>
      </div>
    </div>
  );
});

BroadcastCard.displayName = 'BroadcastCard';

// Memoized confirmation modal
const ConfirmationModal = React.memo(({ deletingId, onConfirm, onCancel }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div
        className="relative w-full max-w-md animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 rounded-xl sm:rounded-2xl blur opacity-30"></div>
        <div className="relative backdrop-blur-2xl bg-white/10 dark:bg-black/40 border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-500/30 flex-shrink-0">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Confirm Deletion
            </h3>
          </div>

          <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 leading-relaxed">
            Are you sure you want to delete this broadcast? This action is <span className="text-red-400 font-semibold">irreversible</span> and will delete the notification for all users.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium transition-all duration-300 hover:scale-[1.02] text-sm sm:text-base"
              style={{ willChange: 'transform' }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!!deletingId}
              className="flex-1 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
              style={{ willChange: 'transform' }}
            >
              {deletingId ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Deleting...
                </span>
              ) : (
                'Delete Forever'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ConfirmationModal.displayName = 'ConfirmationModal';

export default BroadcastHistory;