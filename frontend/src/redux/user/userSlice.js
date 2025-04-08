import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios.js";

const initialState = {
  currentUser: null,
  error: null,
  loading: false,
  isSignInUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signUpStart: (state) => {
      state.loading = true;
      state.error = null;
      state.isSignInUp = true;
    },
    signUpSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
      state.isSignInUp = false;
    },
    signUpFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isSignInUp = false;
    },
    verifyEmailStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    verifyEmailSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.currentUser = action.payload;
    },
    verifyEmailFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
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
    },
    updateProfileSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
      state.currentUser = action.payload;
    },
    updateProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
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
    forgotPasswordStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    forgotPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  }
});


export const {
  signUpStart,
  signUpSuccess,
  signUpFailure,
  verifyEmailStart,
  verifyEmailSuccess,
  verifyEmailFailure,
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
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure
} = userSlice.actions;

export const signup = (data, navigate) => async (dispatch) => {
  dispatch(signUpStart());

  try {
    const res = await axiosInstance.post("/auth/signup", data);

    dispatch(signUpSuccess(res.data));
    navigate("/verify-email");
    toast.success("OTP has been sent to your email");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Signup failed";
    dispatch(signUpFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const verifyEmail = (code, navigate) => async (dispatch) => {
  dispatch(verifyEmailStart());

  try {
    const response = await axiosInstance.post("/auth/verify-email", { code });
    dispatch(verifyEmailSuccess(response.data.user));
    navigate("/");
    toast.success("Account created successfully");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Error in verifying email";
    dispatch(verifyEmailFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const checkAuth = () => async (dispatch, getState) => {
  dispatch(setCheckAuth());

  try {
    const res = await axiosInstance.get("/auth/check", { withCredentials: true });

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
  dispatch(logInStart());

  try {
    const res = await axiosInstance.post("/auth/login", data);
    dispatch(logInSuccess(res.data));

    toast.success("Logged in successfully");

    // Navigate to home after toast shows
    setTimeout(() => {
      navigate("/");
    }, 500); // Navigate a bit sooner than the reload
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Login Failed";
    dispatch(logInFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const logout = (navigate) => async (dispatch) => {
  try {
    await axiosInstance.post("/auth/logout");
    dispatch(logoutSuccess());
    toast.success("Logged out successfully");
    navigate("/login");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Logout failed";
    dispatch(logoutFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export const updateProfile = (userData) => async (dispatch) => {
  dispatch(updateProfileStart());

  try {
    const res = await axiosInstance.put("/auth/update-profile", userData, { withCredentials: true });

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
    await axiosInstance.delete(`/auth/delete/${userId}`, {
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

export const forgotPassword = (email) => async (dispatch) => {
  dispatch(forgotPasswordStart());

  try {
    await axiosInstance.post("/auth/forget-password", { email });
    dispatch(forgotPasswordSuccess());
    toast.success("Password reset link sent to your email");
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Password reset failed";
    dispatch(forgotPasswordFailure(errorMessage));
    toast.error(errorMessage);
  }
};

export default userSlice.reducer;