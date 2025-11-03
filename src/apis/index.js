import axiosInstance from '@/apis/axios';

const loginUser = async (data) => {
  const response = await axiosInstance.post('/auth/company/login', data, {
    isToken: false,
  });
  return response;
};

const getTickets = async () => {
  const response = await axiosInstance.get('/company/tickets');
  return response;
};

const getWorkers = async () => {
  const response = await axiosInstance.get('/company/workers');
  return response;
};

const getBranches = async () => {
  const response = await axiosInstance.get('/company/branches');
  return response;
};

const getAssets = async () => {
  const response = await axiosInstance.get('/company/assets');
  return response;
};

const getUsers = async () => {
  const response = await axiosInstance.get('/company/users');
  return response;
};

export { loginUser, getTickets, getWorkers, getBranches, getAssets, getUsers };
