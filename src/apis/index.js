import axiosInstance from '@/apis/axios';
import { getUserData } from '../helpers';

// ==================== Authentication APIs ====================
const loginUser = async (data) => {
  const response = await axiosInstance.post('/auth/company/login', data, {
    isToken: false,
  });
  return response;
};

const forgotPassword = async (data) => {
  const response = await axiosInstance.post(
    '/auth/company/forgot-password',
    data,
    {
      isToken: false,
    },
  );
  return response;
};

const resetPassword = async (data) => {
  const response = await axiosInstance.post(
    '/auth/company/reset-password',
    data,
    {
      isToken: false,
    },
  );
  return response;
};

// ==================== Company Information APIs ====================
const getCompanyInfo = async () => {
  const response = await axiosInstance.get('/company/');
  return response;
};

// ==================== Ticket Management APIs ====================
const createTicket = async (data) => {
  const response = await axiosInstance.post('/company/tickets', data);
  return response;
};

const getTickets = async (params = {}) => {
  const response = await axiosInstance.get('/company/tickets', { params });
  return response;
};

const getTicketById = async (id) => {
  const response = await axiosInstance.get(`/company/tickets/${id}`);
  return response.data;
};

const approveRejectQuotation = async (id, data) => {
  const response = await axiosInstance.put(
    `/company/tickets/${id}/quotation/approve`,
    data,
  );
  return response.data;
};

const completeTicket = async (id, data = {}) => {
  const response = await axiosInstance.post(
    `/company/tickets/${id}/complete`,
    data,
  );
  return response;
};

const addTicketNote = async (id, data) => {
  const response = await axiosInstance.post(
    `/company/tickets/${id}/notes`,
    data,
  );
  return response;
};

const getParentTickets = async (params = {}) => {
  const response = await axiosInstance.get('/company/tickets/parent', {
    params,
  });
  return response.data;
};

// ==================== Branch Management APIs ====================
const createBranch = async (data) => {
  const response = await axiosInstance.post('/company/branches', data);
  return response;
};

const getBranches = async (params = {}) => {
  const response = await axiosInstance.get('/company/branches', { params });
  return response;
};

const getBranchById = async (id) => {
  const response = await axiosInstance.get(`/company/branches/${id}`);
  return response;
};

const updateBranch = async (id, data) => {
  const response = await axiosInstance.put(`/company/branches/${id}`, data);
  return response;
};

const deleteBranch = async (id) => {
  const response = await axiosInstance.delete(`/company/branches/${id}`);
  return response;
};

const getBranchAssets = async (id) => {
  const response = await axiosInstance.get(`/company/branches/${id}/assets`);
  return response;
};

const getBranchUsers = async (id) => {
  const response = await axiosInstance.get(`/company/branches/${id}/users`);
  return response;
};

// ==================== Asset Management APIs ====================
const createAsset = async (data) => {
  const response = await axiosInstance.post('/company/assets', data);
  return response;
};

const getAssets = async (params = {}) => {
  const response = await axiosInstance.get('/company/assets', { params });
  return response;
};

const getAssetById = async (id) => {
  const response = await axiosInstance.get(`/company/assets/${id}`);
  return response;
};

const updateAsset = async (id, data) => {
  const response = await axiosInstance.put(`/company/assets/${id}`, data);
  return response;
};

const deleteAsset = async (id) => {
  const response = await axiosInstance.delete(`/company/assets/${id}`);
  return response;
};

const getAssetServiceHistory = async (id) => {
  const response = await axiosInstance.get(
    `/company/assets/${id}/service-history`,
  );
  return response;
};

const createAssetServiceRequest = async (id, data) => {
  const response = await axiosInstance.post(
    `/company/assets/${id}/service-request`,
    data,
  );
  return response;
};

// ==================== Company User Management APIs ====================
const createUser = async (data) => {
  const response = await axiosInstance.post('/company/users', data);
  return response;
};

const getUsers = async (params = {}) => {
  const response = await axiosInstance.get('/company/users', { params });
  return response;
};

const getUserById = async (id) => {
  const response = await axiosInstance.get(`/company/users/${id}`);
  return response;
};

const updateUser = async (id, data) => {
  const response = await axiosInstance.put(`/company/users/${id}`, data);
  return response;
};

const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/company/users/${id}`);
  return response;
};

const getUserBranches = async (id) => {
  const response = await axiosInstance.get(`/company/users/${id}/branches`);
  return response;
};

const changePassword = async (data) => {
  const response = await axiosInstance.patch('/company/users/password', data);
  return response;
};

// ==================== Booking Management APIs ====================
const createBooking = async (data) => {
  const response = await axiosInstance.post('/company/bookings', data);
  return response;
};

const getBookings = async (params = {}) => {
  const response = await axiosInstance.get('/company/bookings', { params });
  return response;
};

const getBookingById = async (id) => {
  const response = await axiosInstance.get(`/company/bookings/${id}`);
  return response;
};

const completeBooking = async (id, data) => {
  const response = await axiosInstance.post(
    `/company/bookings/${id}/complete`,
    data,
  );
  return response;
};

const getBookingWorkersList = async () => {
  const response = await axiosInstance.get('/company/bookings/workers/list');
  return response;
};

const getBookingWorker = async (id) => {
  const response = await axiosInstance.get(`/company/bookings/${id}/worker`);
  return response;
};

// ==================== Workers APIs ====================
const getWorkers = async () => {
  const response = await axiosInstance.get('/company/workers');
  return response;
};

// ==================== Contract Management APIs ====================
const getContracts = async () => {
  const userData = getUserData();
  const response = await axiosInstance.get('/admin/contracts', {
    params: { companyId: userData?.user?.company?._id },
  });

  console.log('Contracts response:', response);

  return response;
};

// ==================== Global Services APIs ====================
const getServices = async (params = {}) => {
  const response = await axiosInstance.get('/global/services', { params });
  return response;
};

// ==================== Image Upload APIs ====================
const uploadMultipleImages = async (folderName, imageList) => {
  const formData = new FormData();
  imageList.forEach((file, index) => {
    const originalFile = file.originFileObj || file;
    formData.append(`image${index}`, originalFile);
  });

  const { data: apiRes } = await axiosInstance.post(
    `/global/upload/multiple/${folderName}`,
    formData,
  );

  const urls = Object.values(apiRes?.data?.urls);

  return urls;
};

export {
  // Authentication
  loginUser,
  forgotPassword,
  resetPassword,
  // Company Info
  getCompanyInfo,
  // Tickets
  createTicket,
  getTickets,
  getTicketById,
  approveRejectQuotation,
  completeTicket,
  addTicketNote,
  getParentTickets,
  // Branches
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  getBranchAssets,
  getBranchUsers,
  // Assets
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetServiceHistory,
  createAssetServiceRequest,
  // Users
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserBranches,
  changePassword,
  // Bookings
  createBooking,
  getBookings,
  getBookingById,
  completeBooking,
  getBookingWorkersList,
  getBookingWorker,
  // Workers
  getWorkers,
  //Contracts
  getContracts,
  // Global Services
  getServices,
  // Image Upload
  uploadMultipleImages,
};
