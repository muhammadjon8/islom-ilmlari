import axiosInstance from "./axios-instance";
import { createApi } from "./base.api";

export interface Answer {
  id: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  text_uz: string;
  text_ru: string;
  text_en: string;
  text_arab: string;
  is_correct: boolean;
  question_id?: string;
}

export interface CreateAnswerDto {
  text_uz: string;
  text_ru: string;
  text_en: string;
  text_arab: string;
  is_correct: boolean;
}

export interface CreateMultipleAnswersDto {
  question_id: string;
  answers: CreateAnswerDto[];
}


export const answerApi = {
  ...createApi<Answer>("answers"),

  async createMultiple(data: CreateMultipleAnswersDto): Promise<Answer[]> {
    const response = await axiosInstance.post<{
      status_code: number;
      message: string;
      data: Answer[];
    }>("/answers/multiple", data);

    return response.data.data;
  },
};
