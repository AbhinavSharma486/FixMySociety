import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { PencilIcon, SaveIcon, XIcon, LockIcon } from 'lucide-react';
import { getAdminProfile, updateAdminProfile, changeAdminPassword } from '../../lib/adminService';
import { setAdmin } from '../../redux/admin/adminSlice'; // Corrected import path

const AdminProfilePage = () => {
  const { admin } = useSelector((state) => state.admin);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    profileImage: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [tempProfileImage, setTempProfileImage] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getAdminProfile();
        if (res.success) {
          setProfileData({
            fullName: res.admin.fullName,
            email: res.admin.email,
            profileImage: res.admin.profileImage,
          });
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        console.error("Failed to fetch admin profile:", error);
        toast.error("Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfileImage(reader.result); // This is the base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    try {
      const dataToUpdate = {
        fullName: profileData.fullName,
        email: profileData.email,
        profileImage: tempProfileImage || profileData.profileImage, // Use temp image if new one is selected, otherwise existing
      };
      const res = await updateAdminProfile(dataToUpdate);
      if (res.success) {
        toast.success(res.message);
        dispatch(setAdmin(res.admin)); // Update Redux state with new admin data
        setProfileData({
          fullName: res.admin.fullName,
          email: res.admin.email,
          profileImage: res.admin.profileImage,
        });
        setTempProfileImage(null);
        setEditMode(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Failed to update admin profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await changeAdminPassword(passwordForm);
      if (res.success) {
        toast.success(res.message);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setPasswordChangeMode(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error("Failed to change password.");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-lg">Loading Admin Profile...</div>;
  }

  return (
    <div className="min-h-screen bg-base-200 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="max-w-4xl w-full bg-base-100 dark:bg-gray-800 shadow-xl rounded-lg p-6 lg:p-8 space-y-8">
        <h1 className="text-3xl font-bold text-center text-primary dark:text-gray-100">Admin Profile</h1>

        {/* Profile Information Section */}
        <div className="bg-base-200 dark:bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Profile Information</h2>
          <div className="flex flex-col items-center mb-8">
            <div className="avatar mb-4">
              <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={tempProfileImage || profileData.profileImage || "https://cdn.pixabay.com/photo/2017/02/10/02/54/admin-2055371_1280.png"} alt="Admin Avatar" />
              </div>
            </div>
            {editMode && (
              <input type="file" accept="image/*" onChange={handleImageChange} className="file-input file-input-bordered w-full max-w-xs mb-4 dark:text-gray-200 dark:bg-gray-600" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label"><span className="label-text dark:text-gray-300">Full Name</span></label>
              {editMode ? (
                <input type="text" name="fullName" value={profileData.fullName} onChange={handleProfileChange} className="input input-bordered w-full dark:bg-gray-600 dark:text-gray-200" />
              ) : (
                <p className="py-2 px-3 bg-base-300 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-100">{profileData.fullName}</p>
              )}
            </div>
            <div>
              <label className="label"><span className="label-text dark:text-gray-300">Email</span></label>
              {editMode ? (
                <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} className="input input-bordered w-full dark:bg-gray-600 dark:text-gray-200" />
              ) : (
                <p className="py-2 px-3 bg-base-300 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-100">{profileData.email}</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            {editMode ? (
              <>
                <button onClick={handleProfileSave} className="btn btn-success flex items-center gap-2"><SaveIcon size={20} /> Save</button>
                <button onClick={() => { setEditMode(false); setTempProfileImage(null); }} className="btn btn-ghost flex items-center gap-2 dark:text-gray-300"><XIcon size={20} /> Cancel</button>
              </>
            ) : (
              <button onClick={() => setEditMode(true)} className="btn btn-primary flex items-center gap-2"><PencilIcon size={20} /> Edit Profile</button>
            )}
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-base-200 dark:bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Change Password</h2>
          {passwordChangeMode ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="label"><span className="label-text dark:text-gray-300">Current Password</span></label>
                <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} className="input input-bordered w-full dark:bg-gray-600 dark:text-gray-200" />
              </div>
              <div>
                <label className="label"><span className="label-text dark:text-gray-300">New Password</span></label>
                <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} className="input input-bordered w-full dark:bg-gray-600 dark:text-gray-200" />
              </div>
              <div>
                <label className="label"><span className="label-text dark:text-gray-300">Confirm New Password</span></label>
                <input type="password" name="confirmNewPassword" value={passwordForm.confirmNewPassword} onChange={handlePasswordChange} className="input input-bordered w-full dark:bg-gray-600 dark:text-gray-200" />
              </div>
              <div className="flex justify-end space-x-4">
                <button type="submit" className="btn btn-success flex items-center gap-2"><SaveIcon size={20} /> Update Password</button>
                <button type="button" onClick={() => setPasswordChangeMode(false)} className="btn btn-ghost flex items-center gap-2 dark:text-gray-300"><XIcon size={20} /> Cancel</button>
              </div>
            </form>
          ) : (
            <div className="flex justify-end">
              <button onClick={() => setPasswordChangeMode(true)} className="btn btn-warning flex items-center gap-2"><LockIcon size={20} /> Change Password</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
