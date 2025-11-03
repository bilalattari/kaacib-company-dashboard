import axiosInstance from '@/apis/axios';

const loginUser = async (data) => {
  const response = await axiosInstance.post('/auth/company/login', data, {
    isToken: false,
  });
  return response;
};

export { loginUser };
