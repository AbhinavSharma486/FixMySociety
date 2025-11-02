import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios.js";

const initialState = {
  currentUser: null,
  error: null,
  loading: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setCheckAuth: (state) => {
      state.isCheckingAuth = true;
      state.isLoggingIn = false;
    },
    setCheckAuthComplete: (state) => {
      state.isCheckingAuth = false;
    },
    logInStart: (state) => {
      state.loading = true;
      state.error = null;
      state.isLoggingIn = true;
    },
    logInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
      state.isLoggingIn = false;
    },
    logInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isLoggingIn = false;
    },
    logoutSuccess: (state) => {
      state.currentUser = null;
      state.error = null;
      state.loading = false;
    },
    logoutFailure: (state, action) => {
      state.error = action.payload;
    },
    updateProfileStart: (state) => {
      state.loading = true;
      state.error = null;
      state.isUpdatingProfile = true; // Set to true when update starts
    },
    updateProfileSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.currentUser = action.payload;
      state.isUpdatingProfile = false; // Set to false on success
    },
    updateProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isUpdatingProfile = false; // Set to false on failure
    },
    deleteProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteProfileSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    deleteProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  }
});


export const {
  setUser,
  setCheckAuth,
  setCheckAuthComplete,
  logInStart,
  logInSuccess,
  logInFailure,
  logoutSuccess,
  logoutFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  deleteProfileStart,
  deleteProfileSuccess,
  deleteProfileFailure,

} = userSlice.actions;

export const checkAuth = () => async (dispatch, getState) => {
  dispatch(setCheckAuth());

  try {
    const res = await axiosInstance.get("/api/auth/check", { withCredentials: true });

    if (res.data?.user) {
      dispatch(setUser(res.data.user));
    }
    else {
      console.warn("Warning: checkAuth response missing user data", res.data);
      dispatch(setUser(null));
    }
  } catch (error) {
    console.error("Error in checkAuth", error.response?.data || error.message);
    dispatch(setUser(null));
  } finally {
    dispatch(setCheckAuthComplete());
  }
};

export const login = (data, navigate) => async (dispatch) => {
  try {
    dispatch(logInStart());
    const res = await axiosInstance.post("/api/auth/login", data);
    dispatch(logInSuccess(res.data.user));
    localStorage.setItem("user-token", res.data.token);
    toast.success(res.data.message || "Logged in successfully!");
    if (navigate) {
      navigate("/main");
    }
  } catch (error) {
    dispatch(logInFailure());
    toast.error(error.response?.data?.message || "Login failed.");
  }
};

export const logout = (navigate) => async (dispatch) => {
  try {
    await axiosInstance.post("/api/auth/logout");
    dispatch(logoutSuccess());
    toast.success("Logged out successfully");
    navigate("/main");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Logout failed";
    dispatch(logoutFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const updateProfile = (userData) => async (dispatch) => {
  dispatch(updateProfileStart());

  try {
    const res = await axiosInstance.put("/api/auth/update-profile", userData, { withCredentials: true });

    dispatch(updateProfileSuccess(res.data));
    toast.success("Profile updated successfully");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Profile update failed";
    dispatch(updateProfileFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const deleteProfile = (userId, navigate) => async (dispatch) => {
  dispatch(deleteProfileStart());

  try {
    await axiosInstance.delete(`/api/auth/delete/${userId}`, {
      withCredentials: true
    });

    dispatch(deleteProfileSuccess());
    toast.success("Profile deleted successfully");
    navigate("/");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Profile deletion failed";
    dispatch(deleteProfileFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export default userSlice.reducer;