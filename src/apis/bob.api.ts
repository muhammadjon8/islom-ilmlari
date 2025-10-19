import { createApi } from "./base.api";

export interface BobType {
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
}

export const ilmBobApi = createApi<BobType>("ilm-bob");
export const quranIlmBobApi = createApi<BobType>("quran-ilm-bob");
