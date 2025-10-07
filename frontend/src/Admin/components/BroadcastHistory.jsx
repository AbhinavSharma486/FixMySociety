import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import toastManager from '../../lib/toastManager';

const BroadcastHistory = ({ broadcasts, deleteBroadcast }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const requestDelete = (id) => {
    setConfirmId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    try {
      setDeletingId(confirmId);
      await deleteBroadcast(confirmId);
    } catch (error) {
      // Use toastManager to dedupe with global keys
      toastManager.showError(`broadcast:delete:${confirmId}`, error?.message || 'Failed to delete broadcast.');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
      setShowConfirm(false);
    }
  };

  const cancelDelete = () => {
    setConfirmId(null);
    setShowConfirm(false);
  };

  if (!broadcasts || broadcasts.length === 0) {
    return (
      <div className="bg-base-100 shadow-lg rounded-lg p-6 mt-6">
        <h2 className="text-2xl font-bold mb-4">Broadcast History</h2>
        <p className="text-center text-gray-500">No broadcasts have been sent yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-base-100 shadow-lg rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4">Broadcast History</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Message</th>
              <th>Target</th>
              <th>Sent At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {broadcasts.map((broadcast) => (
              <tr key={broadcast._id}>
                <td>{broadcast.message}</td>
                <td>{broadcast.relatedBuilding ? broadcast.relatedBuilding.buildingName : 'All Buildings'}</td>
                <td>{new Date(broadcast.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => requestDelete(broadcast._id)}
                    className="btn btn-error btn-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm delete</h3>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">Are you sure you want to delete this broadcast? This action is irreversible and will delete the notification for all users.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={cancelDelete} className="btn">Cancel</button>
              <button onClick={confirmDelete} className={`btn btn-error ${deletingId ? 'loading' : ''}`} disabled={!!deletingId}>
                {deletingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastHistory;
