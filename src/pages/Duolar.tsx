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
import TablePagination from "../components/table/TablePagination";
import TableFilter from "../components/table/TableFilter";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const PAGE_SIZE = 10;
  const { create, remove, update, getPaginated } = duasApi;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch duolar with pagination
  const fetchDuolar = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaginated({
        page: currentPage,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setDuolar(response.items || []);
      setTotalPages(response.total_pages || 1);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Duolarni yuklashda xatolik yuz berdi"
      );
      setDuolar([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuolar();
  }, [currentPage, debouncedSearch]);

  const handleView = async (row: Dua) => {
    setSelectedDua(row);
    setViewModalOpen(true);

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

    try {
      setDeleteLoading(true);
      await remove(selectedDua.id);
      toast.success("Duo muvaffaqiyatli o'chirildi");
      setCurrentPage(1); // Reset to first page after deletion
      setConfirmModalOpen(false);
      await fetchDuolar();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Duoni o'chirishda xatolik yuz berdi"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      if (isEditMode && selectedDua) {
        await update(selectedDua.id, data);
        toast.success("Duo muvaffaqiyatli yangilandi");
      } else {
        await create(data as any);
        toast.success("Duo muvaffaqiyatli yaratildi");
        setCurrentPage(1); // Go to first page to see new item
      }
      setFormModalOpen(false);
      await fetchDuolar();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Duoni saqlashda xatolik yuz berdi"
      );
      throw err;
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
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
        label: "Faol",
        value: dua.is_active,
        render: (val) => (val ? "Ha" : "Yo'q"),
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

      <TableFilter
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Qidirish (sarlavha, matn...)"
        disabled={loading}
      />

      {loading && duolar.length === 0 ? (
        <LoadingScreen />
      ) : error && duolar.length === 0 ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
          {loading && duolar.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          )}

          <Table
            columns={columns}
            data={duolar}
            filterKey="title_en"
            hideLocalFilter={true}
            hideLocalPagination={true}
            actions={[
              {
                label: "Ko'rish",
                onClick: handleView,
                className: "text-blue-600 hover:underline",
                icon: <EyeIcon size={20} />,
              },
              {
                label: "Tahrirlash",
                onClick: handleEdit,
                className: "text-green-600 hover:underline",
                icon: <Edit size={20} />,
              },
              {
                label: "O'chirish",
                onClick: handleDelete,
                className: "text-red-600 hover:underline",
                icon: <Trash size={20} />,
              },
            ]}
          />

          {!loading && duolar.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {debouncedSearch
                ? "Hech qanday natija topilmadi"
                : "Duolar mavjud emas"}
            </div>
          )}

          {totalPages > 1 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disabled={loading}
            />
          )}
        </>
      )}

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
          message={`Bu duo o'chirilmoqda: "${selectedDua.title_en}"? O'chirishni tasdiqlang.`}
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
