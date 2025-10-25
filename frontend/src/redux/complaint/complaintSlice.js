import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // You can add initial state related to complaints here if needed
};

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    complaintCreated: (state) => {
      // This reducer doesn't need to modify state, it's just a signal
      console.log('Complaint created action dispatched');
    },
  },
});

export const { complaintCreated } = complaintSlice.actions;

export default complaintSlice.reducer;
