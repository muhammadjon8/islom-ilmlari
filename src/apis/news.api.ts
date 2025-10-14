import { createApi } from "./base.api";

export interface Yangiliklar {
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

export const yangiliklarApi = createApi<Yangiliklar>("admin/news");
