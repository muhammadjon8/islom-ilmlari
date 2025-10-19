import axiosInstance from "./axios-instance";

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

// Response structure for paginated endpoints
interface PaginatedApiResponse<T> {
  data: T[];
  total_elements: number;
  total_pages: number;
  page_size: number;
  current_page: number;
  from: number;
  to: number;
  status_code: number;
  message: string;
}

// Normalized pagination response for frontend use
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface QueryParams {
  lang?: string;
  page?: number;
  page_size?: number;
  search?: string;
}

/**
 * Generic API factory for CRUD operations
 * @param endpoint - API endpoint, e.g., "categories" or "questions"
 */
export const createApi = <T extends { id: string }>(endpoint: string) => {
  return {
    // Get all items without pagination - /endpoint
    getAll: async (params?: QueryParams): Promise<T[]> => {
      const response = await axiosInstance.get<ApiResponse<T[]>>(
        `/${endpoint}`,
        { params }
      );
      return response.data.data;
    },

    // Get paginated items - /endpoint/pagination
    getPaginated: async (
      params?: QueryParams
    ): Promise<PaginatedResponse<T>> => {
      const response = await axiosInstance.get<PaginatedApiResponse<T>>(
        `/${endpoint}/pagination`,
        { params }
      );

      // Normalize the response structure
      return {
        items: response.data.data,
        total: response.data.total_elements,
        page: response.data.current_page,
        page_size: response.data.page_size,
        total_pages: response.data.total_pages,
      };
    },

    getById: async (id: string): Promise<T> => {
      const response = await axiosInstance.get<ApiResponse<T>>(
        `/${endpoint}/${id}`
      );
      return response.data.data;
    },

    create: async (
      item: Omit<T, "id" | "created_at" | "updated_at" | "deleted_at">
    ): Promise<T> => {
      const response = await axiosInstance.post<ApiResponse<T>>(
        `/${endpoint}`,
        item
      );
      return response.data.data;
    },

    update: async (id: string, item: Partial<T>): Promise<T> => {
      const response = await axiosInstance.patch<ApiResponse<T>>(
        `/${endpoint}/${id}`,
        item
      );
      return response.data.data;
    },

    remove: async (id: string): Promise<void> => {
      await axiosInstance.delete(`/${endpoint}/${id}`);
    },
  };
};

export type { QueryParams, PaginatedResponse, PaginatedApiResponse };
