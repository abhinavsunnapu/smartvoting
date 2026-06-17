// API Configuration for Frontend
// Uses Vite environment variables to configure API endpoint

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
  AUTH_CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
  AUTH_REQUEST_OTP: `${API_BASE_URL}/api/auth/request-otp`,
  AUTH_VERIFY_FACE: `${API_BASE_URL}/api/auth/verify-face`,

  // Election endpoints
  ELECTIONS_GET_ALL: `${API_BASE_URL}/api/elections`,
  ELECTIONS_CREATE: `${API_BASE_URL}/api/elections`,
  ELECTIONS_GET_BY_ID: (id) => `${API_BASE_URL}/api/elections/${id}`,
  ELECTIONS_UPDATE: (id) => `${API_BASE_URL}/api/elections/${id}`,
  ELECTIONS_DELETE: (id) => `${API_BASE_URL}/api/elections/${id}`,
  ELECTIONS_ACTIVATE: (id) => `${API_BASE_URL}/api/elections/${id}/activate`,
  ELECTIONS_GET_BALLOTS: (id) => `${API_BASE_URL}/api/elections/${id}/ballots`,

  // Voter endpoints
  VOTER_ELECTIONS_GET_ALL: `${API_BASE_URL}/api/elections/voter`,
  VOTER_ELECTIONS_GET_BY_ID: (id) =>
    `${API_BASE_URL}/api/elections/voter/${id}`,

  // Voting endpoints
  VOTE_CAST: (id) => `${API_BASE_URL}/api/elections/${id}/vote`,
};

export const API_BASE = API_BASE_URL;

export default API_ENDPOINTS;
