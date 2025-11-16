const getAuthToken = () => {
  const userData = localStorage.getItem('user___token');

  if (!userData || userData === 'undefined') {
    return null;
  }
  return JSON.parse(userData).token;
};

const getUserData = () => {
  const userData = localStorage.getItem('user___token');

  if (!userData || userData === 'undefined') {
    return null;
  }
  return JSON.parse(userData);
};

const setAuthToken = (token) => {
  localStorage.setItem('user___token', JSON.stringify(token));
};

const removeAuthToken = () => {
  localStorage.removeItem('user___token');
};

const isValidObjectId = (id) => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};

export {
  getAuthToken,
  getUserData,
  setAuthToken,
  removeAuthToken,
  isValidObjectId,
};
