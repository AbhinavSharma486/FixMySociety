import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios.js";

const initialState = {
  admin: null,
  error: null,
  loading: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: false,
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
      state.admin = action.payload;
      state.loading = false;
      state.error = null;
      state.isLoggingIn = false;
    },
    logInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isLoggingIn = false;
    }
  }
});

export const {
  logInStart,
  logInSuccess,
  logInFailure
} = adminSlice.actions;

export const login = (data, navigate) => async (dispatch) => {
  dispatch(logInStart());

  try {
    const res = await axiosInstance.post("/admin/login", data);
    dispatch(logInSuccess(res.data));

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

export default adminSlice.reducer;