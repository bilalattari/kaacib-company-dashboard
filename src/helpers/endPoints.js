export const ENDPOINTS = {
  // Auth
  COMPANY_LOGIN: 'auth/company/login',
  COMPANY_SIGNUP: 'auth/company/signup',
  COMPANY_ME: 'auth/company/me',

  // Companies (if company portal needs its own company profile)
  COMPANY_PROFILE: 'company/profile',

  // Company Branch Management (company scoped)
  GET_COMPANY_BRANCHES: () => `company/branches`,
  GET_COMPANY_ADMINS: () => `company/users`,

  // Company Assets
  COMPANY_ASSETS: () => 'company/assets',
  COMPANY_ASSET_BY_ID: (id) => `company/assets/${id}`,
  COMPANY_ASSET_SERVICE_HISTORY: (id) => `company/assets/${id}/service-history`,
};


