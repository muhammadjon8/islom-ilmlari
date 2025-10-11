import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  status_code: number;
  data: {
    id: string;
    is_active: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    full_name: string;
    username: string;
    email: string;
    phone_number: string;
    password: string;
    role: string;
    access_token: string;
    refresh_token: string;
  };
  message: string;
}

export const loginUser = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    `${API_BASE_URL}/admin/login`,
    credentials
  );
  return response.data;
};

interface RefreshTokenResponse {
  token: string;
}

export const refreshAccessToken = async (
  refreshToken: string
): Promise<string> => {
  const response = await axios.post<RefreshTokenResponse>(
    `${API_BASE_URL}/auth/refresh-token`,
    { token: refreshToken }
  );
  return response.data.token;
};
