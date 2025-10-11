import axiosInstance from "./axios-instance";

export interface Dua {
  id: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  title_uz: string;
  title_ru: string;
  title_en: string;
  title_arab: string;
  text_uz: string;
  text_ru: string;
  text_en: string;
  text_arab: string;
  file_id: string;
}

interface DuolarResponse {
  status_code: number;
  message: string;
  data: Dua[];
}

export const getDuolar = async (): Promise<Dua[]> => {
  const response = await axiosInstance.get<DuolarResponse>("/duas");
  return response.data.data;
};

export const getDuaById = async (id: string): Promise<Dua> => {
  const response = await axiosInstance.get<{
    status_code: number;
    message: string;
    data: Dua;
  }>(`/duas/${id}`);
  return response.data.data;
};

export const createDua = async (
  dua: Omit<Dua, "id" | "created_at" | "updated_at" | "deleted_at">
): Promise<Dua> => {
  const response = await axiosInstance.post<{
    status_code: number;
    message: string;
    data: Dua;
  }>("/duas", dua);
  return response.data.data;
};

export const updateDua = async (
  id: string,
  dua: Partial<Dua>
): Promise<Dua> => {
  const response = await axiosInstance.patch<{
    status_code: number;
    message: string;
    data: Dua;
  }>(`/duas/${id}`, dua);
  return response.data.data;
};

export const deleteDua = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/duas/${id}`);
};
