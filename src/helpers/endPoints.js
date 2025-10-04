export const ENDPOINTS = {
  // Auth
  COMPANY_LOGIN: 'auth/company/login',
  COMPANY_SIGNUP: 'auth/company/signup',
  COMPANY_ME: 'auth/company/me',

  // Companies (if company portal needs its own company profile)
  COMPANY_PROFILE: 'company/profile',

  // Company Branch Management (company scoped)
  // If companyId is provided, use scoped routes, otherwise default to current company
  GET_COMPANY_BRANCHES: () => `company/branches`,
  CREATE_COMPANY_BRANCH: (companyId) => `company/branches`,
  UPDATE_COMPANY_BRANCH: (companyId, id) => `company/branches/${id}`,
  GET_COMPANY_ADMINS: () => `company/users`,

  // Company Assets
  COMPANY_ASSETS: () => 'company/assets',
  COMPANY_ASSET_BY_ID: (id) => `company/assets/${id}`,
  COMPANY_ASSET_SERVICE_HISTORY: (id) => `company/assets/${id}/service-history`,
  COMPANY_ASSET_SERVICE_REQUEST: (id) => `company/assets/${id}/service-request`,

  // Global Services
  GET_ALL_SERVICES: () => 'global/services',
  GET_SERVICE_BY_ID: (id) => `global/service/${id}`,
  GET_ALL_SUBSERVICES: () => 'global/subservices/',
  GET_SUBSERVICES_BY_SERVICE: (ids) => `global/subservices/by-service/${ids}`,
};


