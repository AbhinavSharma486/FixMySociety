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
  isCheckingAuth: true,
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
  }
});

export const {
  signUpStart,
  signUpSuccess,
  signUpFailure,
  verifyEmailStart,
  verifyEmailSuccess,
  verifyEmailFailure
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

export default userSlice.reducer;