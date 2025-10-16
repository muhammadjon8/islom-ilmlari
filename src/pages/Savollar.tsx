import { Edit, EyeIcon, Trash, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Table from "../components/table/Table";
import type { Column } from "../types/table.type";
import type { FormField } from "../shared/components/FormModal";
import type { ViewField } from "../shared/components/ViewModal";
import ViewModal from "../shared/components/ViewModal";
import FormModal from "../shared/components/FormModal";
import ConfirmModal from "../shared/components/ConfirmModal";
import LoadingScreen from "../components/Loading";
import { toast } from "sonner";
import { questionsApi, type Question } from "../apis/questions.api";
import { categoryApi, type Category } from "../apis/category.api";

const columns: Column<Question>[] = [
  { key: "name_en", label: "Savol (EN)" },
  { key: "name_uz", label: "Savol (UZ)" },
  { key: "name_ru", label: "Savol (RU)" },
  { key: "name_arab", label: "Savol (Arab)" },
];

const Savollar = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { create, remove, update, getAll } = questionsApi;

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAll();
      setQuestions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch questions");
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchCategories();
  }, []);

  const handleView = async (row: Question) => {
    setViewModalOpen(true);
    setSelectedQuestion(row);
  };

  const handleEdit = (row: Question) => {
    setSelectedQuestion(row);
    setIsEditMode(true);
    setFormModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedQuestion(null);
    setIsEditMode(false);
    setFormModalOpen(true);
  };

  const handleDelete = (row: Question) => {
    setSelectedQuestion(row);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedQuestion) return;

    setDeleteLoading(true);
    try {
      await remove(selectedQuestion.id);
      toast.success("Question deleted successfully");
      setQuestions((prev) => prev.filter((q) => q.id !== selectedQuestion.id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete question");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      if (isEditMode && selectedQuestion) {
        await update(selectedQuestion.id, data);
        await fetchQuestions();
        toast.success("Question updated successfully");
      } else {
        await create(data as any);
        await fetchQuestions();
        toast.success("Question created successfully");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save question");
      throw err;
    }
  };

  const formFields: FormField[] = [
    {
      name: "name_en",
      label: "Savol (Inglizcha)",
      type: "text",
      required: true,
      placeholder: "Inglizcha savol kiriting...",
    },
    {
      name: "name_uz",
      label: "Savol (O'zbekcha)",
      type: "text",
      required: true,
      placeholder: "O'zbekcha savol kiriting...",
    },
    {
      name: "name_ru",
      label: "Savol (Ruscha)",
      type: "text",
      required: true,
      placeholder: "Ruscha savol kiriting...",
    },
    {
      name: "name_arab",
      label: "Savol (Arabcha)",
      type: "text",
      required: true,
      placeholder: "Arabcha savol kiriting...",
    },
    {
      name: "category_id",
      label: "Kategoriya",
      type: "searchable-select",
      required: true,
      placeholder: "Kategoriya tanlang...",
      options: categories.map((cat) => ({
        label: `${cat.name_uz} (${cat.name_en})`,
        value: cat.id,
      })),
      fullWidth: true,
    },
  ];

  const getCategoryName = (categoryId: string) => {
    console.log("Category ID:", categoryId);
    console.log("Categories:", categories);
    const category = categories.find((cat) => cat.id === categoryId);
    console.log("Category:", category);
    return category
      ? `${category.name_uz} (${category.name_en})`
      : "Unknown Category";
  };

  const getViewFields = (question: Question): ViewField[] => {
    console.log("Question:", question);
    const fields: ViewField[] = [
      { label: "ID", value: question.id },
      { label: "Savol (Inglizcha)", value: question.name_en },
      { label: "Savol (O'zbekcha)", value: question.name_uz },
      { label: "Savol (Ruscha)", value: question.name_ru },
      { label: "Savol (Arabcha)", value: question.name_arab },
      {
        label: "Kategoriya",
        value: getCategoryName(question.category.id),
      },
      {
        label: "Active",
        value: question.is_active,
        render: (val) => (val ? "Yes" : "No"),
      },
      {
        label: "Yaratilgan vaqti",
        value: new Date(parseInt(question.created_at)).toLocaleString(),
      },
      {
        label: "Yangilangan vaqti",
        value: new Date(parseInt(question.updated_at)).toLocaleString(),
      },
    ];

    return fields;
  };

  if (loading) {
    return <LoadingScreen />;
  }
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Savollar</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors cursor-pointer"
        >
          <Plus size={20} />
          Yangi savol qo'shish
        </button>
      </div>

      <Table
        columns={columns}
        data={questions}
        filterKey="name_en"
        actions={[
          {
            label: "View",
            onClick: handleView,
            className: "text-blue-600 hover:underline",
            icon: <EyeIcon size={20} />,
          },
          {
            label: "Edit",
            onClick: handleEdit,
            className: "text-green-600 hover:underline",
            icon: <Edit size={20} />,
          },
          {
            label: "Delete",
            onClick: handleDelete,
            className: "text-red-600 hover:underline",
            icon: <Trash size={20} />,
          },
        ]}
      />

      {/* View Modal */}
      {selectedQuestion && (
        <ViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Savolni ko'rish: ${selectedQuestion.name_en}`}
          fields={getViewFields(selectedQuestion)}
        />
      )}

      {/* Confirm Delete Modal */}
      {selectedQuestion && (
        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={confirmDelete}
          title="Savolni o'chirish"
          message={`Bu savol o'chirilmoqda: "${selectedQuestion.name_en}"? O'chirishni tasdiqlang.`}
          confirmLabel="O'chirish"
          cancelLabel="Bekor qilish"
          type="danger"
          loading={deleteLoading}
        />
      )}

      {/* Form Modal (Add/Edit) */}
      <FormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={isEditMode ? "Savolni yangilash" : "Yangi savol qo'shish"}
        fields={formFields}
        onSubmit={handleFormSubmit}
        submitLabel={isEditMode ? "Yangilash" : "Yaratish"}
        initialData={selectedQuestion || {}}
      />
    </div>
  );
};

export default Savollar;
