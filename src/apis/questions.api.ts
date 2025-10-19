import type { Answer } from "./answers.api";
import axiosInstance from "./axios-instance";
import { createApi } from "./base.api";
import type { Category } from "./category.api";

export interface Question {
  id: string;
  is_active?: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  name_uz: string;
  name_ru: string;
  name_en: string;
  name_arab: string;
  category?: Category;
  name?: string;
  answers?: Answer[];
  category_name?: string;
}

export interface CreateQuestionDto {
  name_uz: string;
  name_ru: string;
  name_en: string;
  name_arab: string;
  category_id: string;
}

export interface CreateMultipleQuestionsDto {
  category_id: string;
  questions: Omit<CreateQuestionDto, "category_id">[];
}

export interface PaginatedQuestionsResponse<T> {
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

export const questionsApi = {
  ...createApi<Question>("questions"),

  async createMultiple(data: CreateMultipleQuestionsDto): Promise<Question[]> {
    const response = await axiosInstance.post<{
      status_code: number;
      message: string;
      data: Question[];
    }>("/questions/multiple", data);

    return response.data.data;
  },
};
