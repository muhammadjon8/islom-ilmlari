import { Edit, EyeIcon, Trash, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Table from "../components/table/Table";
import type { Column } from "../types/table.type";
import { duasApi, type Dua } from "../apis/duas-api";
import type { FormField } from "../shared/components/FormModal";
import type { ViewField } from "../shared/components/ViewModal";
import ViewModal from "../shared/components/ViewModal";
import FormModal from "../shared/components/FormModal";
import ConfirmModal from "../shared/components/ConfirmModal";
import { getFileById, type FileData } from "../apis/file-upload.api";
import LoadingScreen from "../components/Loading";
import { toast } from "sonner";

const columns: Column<Dua>[] = [
  { key: "title_en", label: "Sarlavha (EN)" },
  { key: "title_uz", label: "Sarlavha (UZ)" },
  { key: "title_ru", label: "Sarlavha (RU)" },
  { key: "title_arab", label: "Sarlavha (Arab)" },
];

const formFields: FormField[] = [
  {
    name: "title_en",
    label: "Sarlavha (Inglizcha)",
    type: "text",
    required: true,
    placeholder: "Inglizcha sarlavha kiriting...",
  },
  {
    name: "title_uz",
    label: "Sarlavha (O'zbekcha)",
    type: "text",
    required: true,
    placeholder: "O'zbekcha sarlavha kiriting...",
  },
  {
    name: "title_ru",
    label: "Sarlavha (Ruscha)",
    type: "text",
    required: true,
    placeholder: "Ruscha sarlavha kiriting...",
  },
  {
    name: "title_arab",
    label: "Sarlavha (Arabcha)",
    type: "text",
    required: true,
    placeholder: "Arabcha sarlavha kiriting...",
  },
  {
    name: "text_en",
    label: "Matn (Inglizcha)",
    type: "textarea",
    required: false,
    placeholder: "Inglizcha matn kiriting...",
    fullWidth: true,
  },
  {
    name: "text_uz",
    label: "Matn (O'zbekcha)",
    type: "textarea",
    required: false,
    placeholder: "O'zbekcha matn kiriting",
    fullWidth: true,
  },
  {
    name: "text_ru",
    label: "Matn (Ruscha)",
    type: "textarea",
    required: false,
    placeholder: "Ruscha matn kiriting...",
    fullWidth: true,
  },
  {
    name: "text_arab",
    label: "Matn (Arabcha)",
    type: "textarea",
    required: false,
    placeholder: "Arabcha matn kiriting...",
    fullWidth: true,
  },
  {
    name: "file_id",
    label: "Yuklanmalar",
    type: "file",
    placeholder: "Rasm yoki fayl kiriting",
    accept: "image/*,.pdf,.doc,.docx",
    fileType: "image",
    fullWidth: true,
  },
];

const Duolar = () => {
  const [duolar, setDuolar] = useState<Dua[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const {create, remove, update, getAll, getById} = duasApi

  const fetchDuolar = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAll();
      setDuolar(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch duas");
      console.error("Error fetching duolar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuolar();
  }, []);

  const handleView = async (row: Dua) => {
    setViewModalOpen(true);
    setSelectedDua(row);

    if (row.file_id) {
      try {
        const file = await getFileById(row.file_id);
        setFileData(file);
      } catch (error) {
        console.error("Failed to fetch file data:", error);
        setFileData(null);
      }
    } else {
      setFileData(null);
    }
  };

  const handleEdit = (row: Dua) => {
    setSelectedDua(row);
    setIsEditMode(true);
    setFormModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedDua(null);
    setIsEditMode(false);
    setFormModalOpen(true);
  };

  const handleDelete = (row: Dua) => {
    setSelectedDua(row);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDua) return;

    setDeleteLoading(true);
    try {
      await remove(selectedDua.id);
      toast.success("Dua deleted successfully");
      setDuolar((prev) => prev.filter((dua) => dua.id !== selectedDua.id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete dua");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      if (isEditMode && selectedDua) {
        await update(selectedDua.id, data);
        await fetchDuolar();
        toast.success("Dua updated successfully");
      } else {
        await create(data as any);
        await fetchDuolar();
        toast.success("Dua created successfully");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save dua");
      throw err;
    }
  };

  const getViewFields = (dua: Dua): ViewField[] => {
    const fields: ViewField[] = [
      { label: "ID", value: dua.id },
      { label: "Sarlavha (Inglizcha)", value: dua.title_en },
      { label: "Sarlavha (O'zbekcha)", value: dua.title_uz },
      { label: "Sarlavha (Ruscha)", value: dua.title_ru },
      { label: "Sarlavha (Arabcha)", value: dua.title_arab },
      { label: "Matn (Inglizcha)", value: dua.text_en, fullWidth: true },
      { label: "Matn (O'zbekcha)", value: dua.text_uz, fullWidth: true },
      { label: "Matn (Ruscha)", value: dua.text_ru, fullWidth: true },
      { label: "Matn (Arabcha)", value: dua.text_arab, fullWidth: true },
    ];

    // Add file field if file exists
    if (dua.file_id && fileData) {
      fields.push({
        label: "Yuklanmalar",
        value: fileData.file_name,
        isFile: true,
        fileId: dua.file_id,
        filePath: fileData.path,
        fileName: fileData.file_name,
        fullWidth: true,
      });
    }

    fields.push(
      {
        label: "Active",
        value: dua.is_active,
        render: (val) => (val ? "Yes" : "No"),
      },
      {
        label: "Yaratilgan vaqti",
        value: new Date(parseInt(dua.created_at)).toLocaleString(),
      },
      {
        label: "Yangilangan vaqti",
        value: new Date(parseInt(dua.updated_at)).toLocaleString(),
      }
    );

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
        <h1 className="text-xl font-semibold">Duolar</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors cursor-pointer"
        >
          <Plus size={20} />
          Yangi duo qo'shish
        </button>
      </div>

      <Table
        columns={columns}
        data={duolar}
        filterKey="title_en"
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
      {selectedDua && (
        <ViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Duoni ko'rish: ${selectedDua.title_en}`}
          fields={getViewFields(selectedDua)}
        />
      )}
      {selectedDua && (
        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={confirmDelete}
          title="Duoni o'chirish"
          message={`Bo duo o'chirilmoqda: "${selectedDua.title_en}"? O'chirishni tasdiqlang.`}
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
        title={isEditMode ? "Duoni yangilash" : "Yangi duo qo'shish"}
        fields={formFields}
        onSubmit={handleFormSubmit}
        submitLabel={isEditMode ? "Yangilash" : "Yaratish"}
        initialData={selectedDua || {}}
      />
    </div>
  );
};

export default Duolar;
