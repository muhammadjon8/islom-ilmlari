import axiosInstance from "./axios-instance";

export interface FileData {
  id: string;
  file_name: string;
  path: string;
  mime_type: string;
  size: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface FileUploadResponse {
  status_code: number;
  message: string;
  data: FileData;
}

interface FileGetResponse {
  status_code: number;
  message: string;
  data: FileData;
}

export const uploadFile = async (file: File): Promise<FileData> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post<FileUploadResponse>(
    "/file",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.data;
};

export const getFileById = async (id: string): Promise<FileData> => {
  const response = await axiosInstance.get<FileGetResponse>(`/file/${id}`);
  return response.data.data;
};

export const deleteFile = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/file/${id}`);
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const downloadFile = async (filePath: string): Promise<void> => {
  try {
    window.open(`${BASE_URL}/upload/${filePath}`, "_blank");
  } catch (error: any) {
    console.error("Download error:", error.response?.data || error.message);
  }
};

// Helper to get full file URL for preview
export const getFileUrl = (path: string): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  return `${baseUrl}/upload/${path}`;
};
