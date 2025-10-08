import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios.js";
import { getAdminProfile } from "../../lib/adminService.js"; // New import

const initialState = {
  admin: null, // admin object
  token: null, // admin JWT token for socket auth
  error: null,
  loading: false,
  isLoggingIn: false,
  isUpdatingProfile: false, // New state
  isCheckingAuth: false, // New state
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    logInStart: (state) => {
      state.loading = true;
      state.error = null;
      state.isLoggingIn = true;
    },
    logInSuccess: (state, action) => {
      // action.payload expected to be { success, message, admin, token }
      state.admin = action.payload.admin || action.payload;
      state.token = action.payload.token || null;
      state.loading = false;
      state.error = null;
      state.isLoggingIn = false;
    },
    logInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isLoggingIn = false;
    },
    setAdmin: (state, action) => { // New reducer to set admin data directly
      state.admin = action.payload;
      state.error = null;
    },
    logoutAdmin: (state) => { // Renamed from logoutSuccess
      state.admin = null;
      state.token = null; // Clear token on logout
      state.error = null;
      state.loading = false;
      localStorage.removeItem("admin-token"); // Ensure token is cleared from localStorage
    },
    logoutFailure: (state, action) => {
      state.error = action.payload;
    },
    checkAuthStart: (state) => { // New reducer
      state.isCheckingAuth = true;
    },
    checkAuthEnd: (state) => { // New reducer
      state.isCheckingAuth = false;
    },
  }
});

export const {
  logInStart,
  logInSuccess,
  logInFailure,
  setAdmin, // New export
  logoutAdmin, // Renamed export
  logoutFailure,
  checkAuthStart, // New export
  checkAuthEnd, // New export
} = adminSlice.actions;

export const login = (data, navigate) => async (dispatch) => {
  dispatch(logInStart());

  try {
    const res = await axiosInstance.post("/api/admin/auth/login", data); // Corrected endpoint
    dispatch(logInSuccess(res.data));

    // persist token for socket reconnection on page reload
    if (res.data?.token) localStorage.setItem("admin-token", res.data.token);

    toast.success("Logged in successfully");

    setTimeout(() => {
      navigate("/admin-dashboard");
    }, 500);
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Login Failed";
    dispatch(logInFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const logout = (navigate) => async (dispatch) => {
  try {
    await axiosInstance.post("/api/admin/auth/logout"); // Corrected endpoint
    dispatch(logoutAdmin()); // Use new logoutAdmin action
    // clear persisted token
    localStorage.removeItem("admin-token");
    toast.success("Logged out successfully");
    if (navigate) navigate("/admin-login");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Logout failed";
    dispatch(logoutFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const checkAdminAuth = () => async (dispatch) => {
  dispatch(checkAuthStart());
  try {
    const token = localStorage.getItem("admin-token");
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await getAdminProfile(); // Fetch profile using the service
      if (res.success) {
        dispatch(setAdmin({ ...res.admin, token })); // Set admin with token
      } else {
        dispatch(logoutAdmin()); // Logout if fetching profile fails
      }
    } else {
      dispatch(logoutAdmin()); // Logout if no token
    }
  } catch (error) {
    console.error("Admin auth check failed:", error);
    dispatch(logoutAdmin()); // Logout on any error during auth check
  } finally {
    dispatch(checkAuthEnd());
  }
};

export default adminSlice.reducer;