import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Category } from "../../apis/category.api";
import SearchableSelect from "../SearchableSelect";

interface QuestionFormData {
  name_en: string;
  name_uz: string;
  name_ru: string;
  name_arab: string;
  category_id: string;
}

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  title: string;
  submitLabel: string;
  initialData?: Partial<QuestionFormData> & { category?: { id: string } };
  categories: Category[];
}

interface FormErrors {
  name_en?: string;
  name_uz?: string;
  name_ru?: string;
  name_arab?: string;
  category_id?: string;
}

const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitLabel,
  initialData = {},
  categories,
}) => {
  const [formData, setFormData] = useState<QuestionFormData>({
    name_en: "",
    name_uz: "",
    name_ru: "",
    name_arab: "",
    category_id: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name_en: initialData.name_en || "",
        name_uz: initialData.name_uz || "",
        name_ru: initialData.name_ru || "",
        name_arab: initialData.name_arab || "",
        category_id: initialData.category_id || initialData.category?.id || "",
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name_en.trim()) {
      newErrors.name_en = "Inglizcha nom kiritish majburiy";
    } else if (formData.name_en.trim().length < 3) {
      newErrors.name_en = "Kamida 3 ta belgi bo'lishi kerak";
    }

    if (!formData.name_uz.trim()) {
      newErrors.name_uz = "O'zbekcha nom kiritish majburiy";
    } else if (formData.name_uz.trim().length < 3) {
      newErrors.name_uz = "Kamida 3 ta belgi bo'lishi kerak";
    }

    if (!formData.name_ru.trim()) {
      newErrors.name_ru = "Ruscha nom kiritish majburiy";
    } else if (formData.name_ru.trim().length < 3) {
      newErrors.name_ru = "Kamida 3 ta belgi bo'lishi kerak";
    }

    if (!formData.name_arab.trim()) {
      newErrors.name_arab = "Arabcha nom kiritish majburiy";
    } else if (formData.name_arab.trim().length < 3) {
      newErrors.name_arab = "Kamida 3 ta belgi bo'lishi kerak";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Kategoriya tanlash majburiy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof QuestionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Name EN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Savol (Inglizcha) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => handleChange("name_en", e.target.value)}
                placeholder="Inglizcha savol kiriting..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.name_en ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.name_en && (
                <p className="text-red-500 text-xs mt-1">{errors.name_en}</p>
              )}
            </div>

            {/* Name UZ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Savol (O'zbekcha) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name_uz}
                onChange={(e) => handleChange("name_uz", e.target.value)}
                placeholder="O'zbekcha savol kiriting..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.name_uz ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.name_uz && (
                <p className="text-red-500 text-xs mt-1">{errors.name_uz}</p>
              )}
            </div>

            {/* Name RU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Savol (Ruscha) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name_ru}
                onChange={(e) => handleChange("name_ru", e.target.value)}
                placeholder="Ruscha savol kiriting..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.name_ru ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
              />
              {errors.name_ru && (
                <p className="text-red-500 text-xs mt-1">{errors.name_ru}</p>
              )}
            </div>

            {/* Name Arab */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Savol (Arabcha) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name_arab}
                onChange={(e) => handleChange("name_arab", e.target.value)}
                placeholder="Arabcha savol kiriting..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.name_arab ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
                dir="rtl"
              />
              {errors.name_arab && (
                <p className="text-red-500 text-xs mt-1">{errors.name_arab}</p>
              )}
            </div>

            {/* Category Searchable Select */}
            <SearchableSelect
              value={formData.category_id}
              onChange={(value) => handleChange("category_id", value)}
              options={categories.map((cat) => ({
                label: cat.name_uz,
                value: cat.id,
                description: `${cat.name_en} • ${cat.name_ru}`,
              }))}
              placeholder="Kategoriya tanlang..."
              disabled={loading}
              error={errors.category_id}
              label="Kategoriya"
              required
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Yuklanmoqda...
                </span>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionFormModal;
