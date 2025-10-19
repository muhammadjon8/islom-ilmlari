import axiosInstance from "./axios-instance";
import {
  createApi,
  type PaginatedApiResponse,
  type PaginatedResponse,
  type QueryParams,
} from "./base.api";

export interface YangiliklarType {
  id: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  title_uz: string;
  title_en: "Title (en)";
  title_ru: string;
  title_arab: string;
  description_uz: string;
  description_en: string;
  description_ru: string;
  description_arab: string;
  url: string;
}

const yangiliklarBaseApi = createApi<YangiliklarType>("admin/news");

export const yangiliklarApi = {
  ...yangiliklarBaseApi,
  getPaginated: async (
    params?: QueryParams
  ): Promise<PaginatedResponse<YangiliklarType>> => {
    const response = await axiosInstance.get<
      PaginatedApiResponse<YangiliklarType>
    >(`/admin/news/all/pagination`, { params });

    return {
      items: response.data.data,
      total: response.data.total_elements,
      page: response.data.current_page,
      page_size: response.data.page_size,
      total_pages: response.data.total_pages,
    };
  },
};
