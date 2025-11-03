const getAuthToken = () => {
  const token = localStorage.getItem('user___token');

  if (!token || token === 'undefined') {
    return null;
  }
  return token;
};

const setAuthToken = (token) => {
  localStorage.setItem('user___token', token);
};

const removeAuthToken = () => {
  localStorage.removeItem('user___token');
};

export { getAuthToken, setAuthToken, removeAuthToken };
