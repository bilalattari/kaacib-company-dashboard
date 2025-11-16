import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  company: null,
  contracts: [],
  status: 'idle',
  error: null,
};

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanyInfo: (state, action) => {
      state.company = action.payload.company;
      state.contracts = action.payload.contracts;
    },
  },
});

export const selectCompanyInfo = (state) => state.company.company;
export const selectCompanyContracts = (state) => state.company.contracts;
export const selectCompanyStatus = (state) => state.company.status;
export const selectCompanyError = (state) => state.company.error;
export const { setCompanyInfo } = companySlice.actions;
export default companySlice.reducer;
