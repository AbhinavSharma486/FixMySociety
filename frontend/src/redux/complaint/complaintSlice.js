import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // You can add initial state related to complaints here if needed
};

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    complaintCreated: (state) => {
    },
  },
});

export const { complaintCreated } = complaintSlice.actions;

export default complaintSlice.reducer;
