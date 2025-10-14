import { createApi } from "./base.api";

export interface Category {
  id: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name_uz: string;
  name_ru: string;
  name_en: string;
  name_arab: string;
}

export const categoryApi = createApi<Category>("category");
