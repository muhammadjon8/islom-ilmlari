import { Edit, EyeIcon, Trash, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Table from "../components/table/Table";
import type { Column } from "../types/table.type";
import { hajAmallariApi, type HajAmallariType } from "../apis/haj-amallari.api";
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
import { dateFormatted } from "../shared/utils/dateFormatted";

const columns: Column<HajAmallariType>[] = [
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
    required: true,
    placeholder: "Inglizcha matn kiriting...",
    fullWidth: true,
  },
  {
    name: "text_uz",
    label: "Matn (O'zbekcha)",
    type: "textarea",
    required: true,
    placeholder: "O'zbekcha matn kiriting",
    fullWidth: true,
  },
  {
    name: "text_ru",
    label: "Matn (Ruscha)",
    type: "textarea",
    required: true,
    placeholder: "Ruscha matn kiriting...",
    fullWidth: true,
  },
  {
    name: "text_arab",
    label: "Matn (Arabcha)",
    type: "textarea",
    required: true,
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

const HajAmallari = () => {
  const [hajAmallari, setHajAmallari] = useState<HajAmallariType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedHajAmal, setSelectedHajAmal] =
    useState<HajAmallariType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const PAGE_SIZE = 10;
  const { create, remove, update, getPaginated } = hajAmallariApi;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch haj amallari with pagination
  const fetchHajAmallari = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaginated({
        page: currentPage,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setHajAmallari(response.items || []);
      setTotalPages(response.total_pages || 1);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Haj amallarini yuklashda xatolik yuz berdi"
      );
      setHajAmallari([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHajAmallari();
  }, [currentPage, debouncedSearch]);

  const handleView = async (row: HajAmallariType) => {
    setSelectedHajAmal(row);
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

  const handleEdit = (row: HajAmallariType) => {
    setSelectedHajAmal(row);
    setIsEditMode(true);
    setFormModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedHajAmal(null);
    setIsEditMode(false);
    setFormModalOpen(true);
  };

  const handleDelete = (row: HajAmallariType) => {
    setSelectedHajAmal(row);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedHajAmal) return;

    try {
      setDeleteLoading(true);
      await remove(selectedHajAmal.id);
      toast.success("Haj amali muvaffaqiyatli o'chirildi");
      setCurrentPage(1); // Reset to first page after deletion
      setConfirmModalOpen(false);
      await fetchHajAmallari();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Haj amalini o'chirishda xatolik yuz berdi"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      if (isEditMode && selectedHajAmal) {
        await update(selectedHajAmal.id, data);
        toast.success("Haj amali muvaffaqiyatli yangilandi");
      } else {
        await create(data as any);
        toast.success("Haj amali muvaffaqiyatli yaratildi");
        setCurrentPage(1); // Go to first page to see new item
      }
      setFormModalOpen(false);
      await fetchHajAmallari();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Haj amalini saqlashda xatolik yuz berdi"
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

  const getViewFields = (hajAmal: HajAmallariType): ViewField[] => {
    const fields: ViewField[] = [
      { label: "ID", value: hajAmal.id },
      { label: "Sarlavha (Inglizcha)", value: hajAmal.title_en },
      { label: "Sarlavha (O'zbekcha)", value: hajAmal.title_uz },
      { label: "Sarlavha (Ruscha)", value: hajAmal.title_ru },
      { label: "Sarlavha (Arabcha)", value: hajAmal.title_arab },
      { label: "Matn (Inglizcha)", value: hajAmal.text_en, fullWidth: true },
      { label: "Matn (O'zbekcha)", value: hajAmal.text_uz, fullWidth: true },
      { label: "Matn (Ruscha)", value: hajAmal.text_ru, fullWidth: true },
      { label: "Matn (Arabcha)", value: hajAmal.text_arab, fullWidth: true },
    ];

    // Add file field if file exists
    if (hajAmal.file_id && fileData) {
      fields.push({
        label: "Yuklanmalar",
        value: fileData.file_name,
        isFile: true,
        fileId: hajAmal.file_id,
        filePath: fileData.path,
        fileName: fileData.file_name,
        fullWidth: true,
      });
    }

    fields.push(
      {
        label: "Faol",
        value: hajAmal.is_active,
        render: (val) => (val ? "Ha" : "Yo'q"),
      },
      {
        label: "Yaratilgan vaqti",
        value: hajAmal.created_at,
        render: (val) => dateFormatted(val),
      },
      {
        label: "Yangilangan vaqti",
        value: hajAmal.updated_at,
        render: (val) => dateFormatted(val),
      }
    );

    return fields;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Haj Amallari</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors cursor-pointer"
        >
          <Plus size={20} />
          Yangi haj amali qo'shish
        </button>
      </div>

      <TableFilter
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Qidirish (sarlavha, matn...)"
        disabled={loading}
      />

      {loading && hajAmallari.length === 0 ? (
        <LoadingScreen />
      ) : error && hajAmallari.length === 0 ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
          {loading && hajAmallari.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          )}

          <Table
            columns={columns}
            data={hajAmallari}
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

          {!loading && hajAmallari.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {debouncedSearch
                ? "Hech qanday natija topilmadi"
                : "Haj amallari mavjud emas"}
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

      {selectedHajAmal && (
        <ViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Haj amalini ko'rish: ${selectedHajAmal.title_en}`}
          fields={getViewFields(selectedHajAmal)}
        />
      )}

      {selectedHajAmal && (
        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={confirmDelete}
          title="Haj amalini o'chirish"
          message={`Bu haj amali o'chirilmoqda: "${selectedHajAmal.title_en}"? O'chirishni tasdiqlang.`}
          confirmLabel="O'chirish"
          cancelLabel="Bekor qilish"
          type="danger"
          loading={deleteLoading}
        />
      )}

      <FormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={
          isEditMode ? "Haj amalini yangilash" : "Yangi haj amali qo'shish"
        }
        fields={formFields}
        onSubmit={handleFormSubmit}
        submitLabel={isEditMode ? "Yangilash" : "Yaratish"}
        initialData={selectedHajAmal || {}}
      />
    </div>
  );
};

export default HajAmallari;
