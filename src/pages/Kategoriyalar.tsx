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
import { categoryApi, type Category } from "../apis/category.api";

const columns: Column<Category>[] = [
  { key: "name_en", label: "Nomi (EN)" },
  { key: "name_uz", label: "Nomi (UZ)" },
  { key: "name_ru", label: "Nomi (RU)" },
  { key: "name_arab", label: "Nomi (Arab)" },
];

const formFields: FormField[] = [
  {
    name: "name_en",
    label: "Nomi (Inglizcha)",
    type: "text",
    required: true,
    placeholder: "Inglizcha nom kiriting...",
  },
  {
    name: "name_uz",
    label: "Nomi (O'zbekcha)",
    type: "text",
    required: true,
    placeholder: "O'zbekcha nom kiriting...",
  },
  {
    name: "name_ru",
    label: "Nomi (Ruscha)",
    type: "text",
    required: true,
    placeholder: "Ruscha nom kiriting...",
  },
  {
    name: "name_arab",
    label: "Nomi (Arabcha)",
    type: "text",
    required: true,
    placeholder: "Arabcha nom kiriting...",
  },
];

const Kategoriyalar = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { create, remove, update, getAll } = categoryApi;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch categories");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleView = async (row: Category) => {
    setViewModalOpen(true);
    setSelectedCategory(row);
  };

  const handleEdit = (row: Category) => {
    setSelectedCategory(row);
    setIsEditMode(true);
    setFormModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setIsEditMode(false);
    setFormModalOpen(true);
  };

  const handleDelete = (row: Category) => {
    setSelectedCategory(row);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;

    setDeleteLoading(true);
    try {
      await remove(selectedCategory.id);
      toast.success("Category deleted successfully");
      setCategories((prev) =>
        prev.filter((cat) => cat.id !== selectedCategory.id)
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      if (isEditMode && selectedCategory) {
        await update(selectedCategory.id, data);
        await fetchCategories();
        toast.success("Category updated successfully");
      } else {
        await create(data as any);
        await fetchCategories();
        toast.success("Category created successfully");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save category");
      throw err;
    }
  };

  const getViewFields = (category: Category): ViewField[] => {
    const fields: ViewField[] = [
      { label: "ID", value: category.id },
      { label: "Nomi (Inglizcha)", value: category.name_en },
      { label: "Nomi (O'zbekcha)", value: category.name_uz },
      { label: "Nomi (Ruscha)", value: category.name_ru },
      { label: "Nomi (Arabcha)", value: category.name_arab },
      {
        label: "Active",
        value: category.is_active,
        render: (val) => (val ? "Yes" : "No"),
      },
      {
        label: "Yaratilgan vaqti",
        value: new Date(parseInt(category.created_at)).toLocaleString(),
      },
      {
        label: "Yangilangan vaqti",
        value: new Date(parseInt(category.updated_at)).toLocaleString(),
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
        <h1 className="text-xl font-semibold">Kategoriyalar</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors cursor-pointer"
        >
          <Plus size={20} />
          Yangi kategoriya qo'shish
        </button>
      </div>

      <Table
        columns={columns}
        data={categories}
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
      {selectedCategory && (
        <ViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Kategoriyani ko'rish: ${selectedCategory.name_en}`}
          fields={getViewFields(selectedCategory)}
        />
      )}

      {/* Confirm Delete Modal */}
      {selectedCategory && (
        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={confirmDelete}
          title="Kategoriyani o'chirish"
          message={`Bu kategoriya o'chirilmoqda: "${selectedCategory.name_en}"? O'chirishni tasdiqlang.`}
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
        title={
          isEditMode ? "Kategoriyani yangilash" : "Yangi kategoriya qo'shish"
        }
        fields={formFields}
        onSubmit={handleFormSubmit}
        submitLabel={isEditMode ? "Yangilash" : "Yaratish"}
        initialData={selectedCategory || {}}
      />
    </div>
  );
};

export default Kategoriyalar;
