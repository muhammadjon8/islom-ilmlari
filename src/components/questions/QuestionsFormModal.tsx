import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { Category } from "../../apis/category.api";
import SearchableSelect from "../SearchableSelect";

export interface QuestionFormData {
  name_en: string;
  name_uz: string;
  name_ru: string;
  name_arab: string;
  category_id: string;
}

export interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionFormData | QuestionFormData[]) => Promise<void>;
  title: string;
  submitLabel: string;
  initialData?: Partial<QuestionFormData> & { category?: { id: string } };
  categories: Category[];
  isEditMode?: boolean;
}

interface FormErrors {
  [key: number]: {
    name_en?: string;
    name_uz?: string;
    name_ru?: string;
    name_arab?: string;
    category_id?: string;
  };
}

const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitLabel,
  initialData = {},
  categories,
  isEditMode = false,
}) => {
  const [questions, setQuestions] = useState<QuestionFormData[]>([
    {
      name_en: "",
      name_uz: "",
      name_ru: "",
      name_arab: "",
      category_id: "",
    },
  ]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [searchQueries, setSearchQueries] = useState<{ [key: number]: string }>(
    {}
  );
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: number]: boolean;
  }>({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        setQuestions([
          {
            name_en: initialData.name_en || "",
            name_uz: initialData.name_uz || "",
            name_ru: initialData.name_ru || "",
            name_arab: initialData.name_arab || "",
            category_id:
              initialData.category_id || initialData.category?.id || "",
          },
        ]);
      } else {
        setQuestions([
          {
            name_en: "",
            name_uz: "",
            name_ru: "",
            name_arab: "",
            category_id: "",
          },
        ]);
      }
      setErrors({});
      setSearchQueries({});
      setOpenDropdowns({});
    }
  }, [isOpen, initialData, isEditMode]);

  const validateQuestion = (
    question: QuestionFormData
  ): {
    name_en?: string;
    name_uz?: string;
    name_ru?: string;
    name_arab?: string;
    category_id?: string;
  } => {
    const questionErrors: any = {};

    if (!question.name_en.trim()) {
      questionErrors.name_en = "Inglizcha nom kiritish majburiy";
    } else if (question.name_en.trim().length < 2) {
      questionErrors.name_en = "Kamida 2 ta belgi bo'lishi kerak";
    }

    if (!question.name_uz.trim()) {
      questionErrors.name_uz = "O'zbekcha nom kiritish majburiy";
    } else if (question.name_uz.trim().length < 2) {
      questionErrors.name_uz = "Kamida 2 ta belgi bo'lishi kerak";
    }

    if (!question.name_ru.trim()) {
      questionErrors.name_ru = "Ruscha nom kiritish majburiy";
    } else if (question.name_ru.trim().length < 2) {
      questionErrors.name_ru = "Kamida 2 ta belgi bo'lishi kerak";
    }

    if (!question.name_arab.trim()) {
      questionErrors.name_arab = "Arabcha nom kiritish majburiy";
    } else if (question.name_arab.trim().length < 2) {
      questionErrors.name_arab = "Kamida 2 ta belgi bo'lishi kerak";
    }

    if (!question.category_id) {
      questionErrors.category_id = "Kategoriya tanlash majburiy";
    }

    return questionErrors;
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    questions.forEach((question, index) => {
      const questionErrors = validateQuestion(question);
      if (Object.keys(questionErrors).length > 0) {
        newErrors[index] = questionErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      // If single question, send as object; if multiple, send as array
      if (questions.length === 1) {
        await onSubmit(questions[0]);
      } else {
        await onSubmit(questions);
      }
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    index: number,
    field: keyof QuestionFormData,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);

    // Clear error when user starts typing
    if (errors[index]?.[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[index][field];
      if (Object.keys(updatedErrors[index]).length === 0) {
        delete updatedErrors[index];
      }
      setErrors(updatedErrors);
    }
  };

  const handleCategorySelect = (index: number, categoryId: string) => {
    handleChange(index, "category_id", categoryId);
    setOpenDropdowns({ ...openDropdowns, [index]: false });
    setSearchQueries({ ...searchQueries, [index]: "" });
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        name_en: "",
        name_uz: "",
        name_ru: "",
        name_arab: "",
        category_id: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const updatedQuestions = questions.filter((_, i) => i !== index);
      setQuestions(updatedQuestions);

      // Remove errors for this index and reindex
      const updatedErrors = { ...errors };
      delete updatedErrors[index];
      const reindexedErrors: FormErrors = {};
      Object.keys(updatedErrors).forEach((key) => {
        const numKey = parseInt(key);
        if (numKey > index) {
          reindexedErrors[numKey - 1] = updatedErrors[numKey];
        } else {
          reindexedErrors[numKey] = updatedErrors[numKey];
        }
      });
      setErrors(reindexedErrors);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{title}</h2>
            {!isEditMode && questions.length > 1 && (
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm">
                {questions.length} ta savol
              </span>
            )}
          </div>
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
          <div className="space-y-6">
            {questions.map((question, index) => {
              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 relative"
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">
                      {isEditMode ? "Savol" : `Savol ${index + 1}`}
                    </h3>
                    {!isEditMode && questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                        title="Savolni o'chirish"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Name EN */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Savol (Inglizcha){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={question.name_en}
                        onChange={(e) =>
                          handleChange(index, "name_en", e.target.value)
                        }
                        placeholder="Inglizcha savol kiriting..."
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors[index]?.name_en
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={loading}
                      />
                      {errors[index]?.name_en && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[index].name_en}
                        </p>
                      )}
                    </div>

                    {/* Name UZ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Savol (O'zbekcha){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={question.name_uz}
                        onChange={(e) =>
                          handleChange(index, "name_uz", e.target.value)
                        }
                        placeholder="O'zbekcha savol kiriting..."
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors[index]?.name_uz
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={loading}
                      />
                      {errors[index]?.name_uz && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[index].name_uz}
                        </p>
                      )}
                    </div>

                    {/* Name RU */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Savol (Ruscha) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={question.name_ru}
                        onChange={(e) =>
                          handleChange(index, "name_ru", e.target.value)
                        }
                        placeholder="Ruscha savol kiriting..."
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors[index]?.name_ru
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={loading}
                      />
                      {errors[index]?.name_ru && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[index].name_ru}
                        </p>
                      )}
                    </div>

                    {/* Name Arab */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Savol (Arabcha) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={question.name_arab}
                        onChange={(e) =>
                          handleChange(index, "name_arab", e.target.value)
                        }
                        placeholder="Arabcha savol kiriting..."
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors[index]?.name_arab
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={loading}
                        dir="rtl"
                      />
                      {errors[index]?.name_arab && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[index].name_arab}
                        </p>
                      )}
                    </div>

                    <SearchableSelect
                      value={question.category_id}
                      onChange={(value) => handleCategorySelect(index, value)}
                      options={categories.map((cat) => ({
                        label: cat.name_uz,
                        value: cat.id,
                        description: `${cat.name_en} • ${cat.name_ru}`,
                      }))}
                      placeholder="Kategoriya tanlang..."
                      disabled={loading}
                      error={errors[index]?.category_id}
                      label="Kategoriya"
                      required
                    />
                  </div>
                </div>
              );
            })}

            {/* Add Question Button */}
            {!isEditMode && (
              <button
                type="button"
                onClick={addQuestion}
                className="w-full border-2 border-dashed border-indigo-300 rounded-lg p-4 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-colors flex items-center justify-center gap-2"
                disabled={loading}
              >
                <Plus size={20} />
                Yana savol qo'shish
              </button>
            )}
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
