import { X, Plus, Trash2 } from "lucide-react";
import type { Category } from "../../apis/category.api";
import { questionsApi } from "../../apis/questions.api";
import SearchableSelect from "../SearchableSelect";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const questionSchema = z.object({
  name_uz: z.string().min(1, "Required").max(255),
  name_ru: z.string().min(1, "Required").max(255),
  name_en: z.string().min(1, "Required").max(255),
  name_arab: z.string().min(1, "Required").max(255),
});

const formSchema = z.object({
  category_id: z.string().nonempty("Please select a category"),
  questions: z
    .array(questionSchema)
    .min(1, "Add at least one question")
    .max(50, "Maximum 50 questions"),
});

type FormValues = z.infer<typeof formSchema>;

export interface MultipleQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess?: () => void;
}

export default function MultipleQuestionsModal({
  isOpen,
  onClose,
  categories,
  onSuccess,
}: MultipleQuestionsModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_id: "",
      questions: [{ name_uz: "", name_ru: "", name_en: "", name_arab: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  if (!isOpen) return null;

  const onSubmit = async (values: FormValues) => {
    try {
      await questionsApi.createMultiple(values);
      onSuccess?.();
      onClose();
      remove();
      append({
        name_uz: "",
        name_ru: "",
        name_en: "",
        name_arab: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create questions. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          Ko'proq savollar qo'shish
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={categories.map((cat) => ({
                    label: cat.name_en || cat.name_uz,
                    value: cat.id,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Kategoriyani tanlang..."
                />
              )}
            />
            {errors.category_id && (
              <p className="text-red-500 text-xs mt-1">
                {errors.category_id.message}
              </p>
            )}
          </div>

          {/* Questions List */}
          <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border rounded-xl p-4 relative bg-gray-50"
              >
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>

                <div className="grid grid-cols-2 gap-3">
                  {(
                    ["name_uz", "name_ru", "name_en", "name_arab"] as const
                  ).map((lang) => (
                    <div key={lang}>
                      <label className="text-sm font-medium capitalize">
                        Name ({lang.replace("name_", "").toUpperCase()})
                      </label>
                      <Controller
                        name={`questions.${index}.${lang}`}
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                            placeholder={`Enter question in ${lang
                              .replace("name_", "")
                              .toUpperCase()}`}
                          />
                        )}
                      />
                      {errors.questions?.[index]?.[lang] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.questions?.[index]?.[lang]?.message as string}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add / Submit Buttons */}
          <div className="flex justify-between items-center mt-5">
            <button
              type="button"
              onClick={() =>
                append({ name_uz: "", name_ru: "", name_en: "", name_arab: "" })
              }
              className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              <Plus size={16} /> Savol qo'shish
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>

          {errors.questions && (
            <p className="text-red-500 text-sm">{errors.questions.message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
