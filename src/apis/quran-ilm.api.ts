import { createApi } from "./base.api";

export interface QuranIlmType {
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
  bob_id: string;
}


export const quranIlmAPi = createApi<QuranIlmType>("quran-ilm");
