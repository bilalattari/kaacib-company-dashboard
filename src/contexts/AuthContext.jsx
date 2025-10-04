import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { message } from 'antd';
import api from '../helpers/api';

// Auth Context
const AuthContext = createContext();

// Auth Actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial State
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tokenExpiry: null
};

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        tokenExpiry: action.payload.tokenExpiry,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        tokenExpiry: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState
      };

    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        tokenExpiry: action.payload.tokenExpiry,
        user: action.payload.user
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Token Management Utilities
const TokenManager = {
  // Get token from cookies
  getToken: () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('company-auth-token='))
      ?.split('=')[1];
    return token ? decodeURIComponent(token) : null;
  },

  // Get refresh token from cookies
  getRefreshToken: () => {
    const refreshToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('refreshToken='))
      ?.split('=')[1];
    return refreshToken ? decodeURIComponent(refreshToken) : null;
  },

  // Set token in cookies
  setToken: (token, refreshToken = null) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000)); // 24 hours

    document.cookie = `company-auth-token=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
    
    if (refreshToken) {
      const refreshExpires = new Date();
      refreshExpires.setTime(refreshExpires.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
      document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; expires=${refreshExpires.toUTCString()}; path=/; secure; samesite=strict`;
    }
  },

  // Clear tokens from cookies
  clearTokens: () => {
    document.cookie = 'company-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  },

  // Check if token is expired
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  },

  // Decode token and get user info
  decodeToken: (token) => {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initializeAuth = async () => {
      const token = TokenManager.getToken();
      const refreshToken = TokenManager.getRefreshToken();

      if (token && !TokenManager.isTokenExpired(token)) {
        try {
          const decodedUser = TokenManager.decodeToken(token);
          if (decodedUser) {
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: decodedUser,
                token,
                refreshToken,
                tokenExpiry: decodedUser.exp
              }
            });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          TokenManager.clearTokens();
        }
      } else if (refreshToken) {
        // Try to refresh token
        await refreshAuthToken();
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (state.token && state.tokenExpiry) {
      const timeUntilExpiry = (state.tokenExpiry * 1000) - Date.now();
      const refreshTime = timeUntilExpiry - (5 * 60 * 1000); // Refresh 5 minutes before expiry

      if (refreshTime > 0) {
        const timer = setTimeout(() => {
          refreshAuthToken();
        }, refreshTime);

        return () => clearTimeout(timer);
      }
    }
  }, [state.token, state.tokenExpiry]);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await api.post('/auth/company/login', credentials);
      const { token, refreshToken, user } = response.data.data || response.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      // Decode token to get user info
      const decodedUser = TokenManager.decodeToken(token);
      
      if (!decodedUser) {
        throw new Error('Invalid token received');
      }

      // Store tokens in cookies
      TokenManager.setToken(token, refreshToken);

      // Update API instance with new token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: decodedUser,
          token,
          refreshToken,
          tokenExpiry: decodedUser.exp
        }
      });

      message.success('Login successful!');
      return { success: true, user: decodedUser };

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });

      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint if token exists
      if (state.token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear tokens and reset state
      TokenManager.clearTokens();
      delete api.defaults.headers.common['Authorization'];
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      message.success('Logged out successfully');
    }
  };

  // Refresh token function
  const refreshAuthToken = async () => {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!refreshToken) {
      logout();
      return false;
    }

    try {
      const response = await api.post('/auth/refresh', {
        refreshToken
      });

      const { token, refreshToken: newRefreshToken } = response.data.data || response.data;

      if (!token) {
        throw new Error('No token received from refresh');
      }

      // Decode new token
      const decodedUser = TokenManager.decodeToken(token);
      
      if (!decodedUser) {
        throw new Error('Invalid token received from refresh');
      }

      // Store new tokens
      TokenManager.setToken(token, newRefreshToken);

      // Update API instance
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN,
        payload: {
          token,
          refreshToken: newRefreshToken,
          tokenExpiry: decodedUser.exp,
          user: decodedUser
        }
      });

      return true;

    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  // Set loading state
  const setLoading = (loading) => {
    dispatch({
      type: AUTH_ACTIONS.SET_LOADING,
      payload: loading
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return state.user?.permissions?.includes(permission);
  };

  // Get user's company ID
  const getCompanyId = () => {
    return state.user?.company_id || state.user?.companyId;
  };

  // Context value
  const contextValue = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    logout,
    refreshAuthToken,
    setLoading,
    clearError,

    // Utilities
    hasRole,
    hasPermission,
    getCompanyId,

    // Token utilities
    isTokenExpired: () => TokenManager.isTokenExpired(state.token),
    decodeToken: TokenManager.decodeToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Higher-order component for protected routes
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div>Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Will be redirected by router
    }

    return <WrappedComponent {...props} />;
  };
};

export default AuthContext;
