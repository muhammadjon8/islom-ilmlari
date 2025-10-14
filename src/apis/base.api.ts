import axiosInstance from "./axios-instance";

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

/**
 * Generic API factory for CRUD operations
 * @param endpoint - API endpoint, e.g., "categories" or "duas"
 */
export const createApi = <T extends { id: string }>(endpoint: string) => {
  return {
    getAll: async (): Promise<T[]> => {
      const response = await axiosInstance.get<ApiResponse<T[]>>(
        `/${endpoint}`
      );
      return response.data.data;
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
