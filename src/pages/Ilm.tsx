import { Edit, EyeIcon, Trash, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Table from "../components/table/Table";
import type { Column } from "../types/table.type";
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
import { ilmAPi, type IlmType } from "../apis/ilm.api";
import { ilmBobApi, type BobType } from "../apis/bob.api";
import { dateFormatted } from "../shared/utils/dateFormatted";

const columns: Column<IlmType>[] = [
  { key: "title_en", label: "Sarlavha (EN)" },
  { key: "title_uz", label: "Sarlavha (UZ)" },
  { key: "title_ru", label: "Sarlavha (RU)" },
  { key: "title_arab", label: "Sarlavha (Arab)" },
];

const Ilm = () => {
  const [ilmlar, setIlmlar] = useState<IlmType[]>([]);
  const [bobs, setBobs] = useState<BobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedIlm, setSelectedIlm] = useState<IlmType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const PAGE_SIZE = 10;
  const { create, remove, update, getPaginated } = ilmAPi;

  // Fetch bobs for searchable-select
  useEffect(() => {
    const fetchBobs = async () => {
      try {
        const response = await ilmBobApi.getPaginated({
          page: 1,
          page_size: 1000, // Fetch all bobs (adjust if needed)
        });
        setBobs(response.items || []);
      } catch (err: any) {
        console.error("Failed to fetch bobs:", err);
      }
    };
    fetchBobs();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch ilmlar with pagination
  const fetchIlmlar = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaginated({
        page: currentPage,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setIlmlar(response.items || []);
      setTotalPages(response.total_pages || 1);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Ilmlarni yuklashda xatolik yuz berdi"
      );
      setIlmlar([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIlmlar();
  }, [currentPage, debouncedSearch]);

  const handleView = async (row: IlmType) => {
    setSelectedIlm(row);
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

  const handleEdit = (row: IlmType) => {
    setSelectedIlm(row);
    setIsEditMode(true);
    setFormModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedIlm(null);
    setIsEditMode(false);
    setFormModalOpen(true);
  };

  const handleDelete = (row: IlmType) => {
    setSelectedIlm(row);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedIlm) return;

    try {
      setDeleteLoading(true);
      await remove(selectedIlm.id);
      toast.success("Ilm muvaffaqiyatli o'chirildi");
      setCurrentPage(1); // Reset to first page after deletion
      setConfirmModalOpen(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Ilmni o'chirishda xatolik yuz berdi"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      if (isEditMode && selectedIlm) {
        await update(selectedIlm.id, data);
        toast.success("Ilm muvaffaqiyatli yangilandi");
      } else {
        await create(data as any);
        toast.success("Ilm muvaffaqiyatli yaratildi");
        setCurrentPage(1); // Go to first page to see new item
      }
      setFormModalOpen(false);
      await fetchIlmlar();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Ilmni saqlashda xatolik yuz berdi"
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

  const getViewFields = (ilm: IlmType): ViewField[] => {
    const fields: ViewField[] = [
      { label: "ID", value: ilm.id },
      { label: "Sarlavha (Inglizcha)", value: ilm.title_en },
      { label: "Sarlavha (O'zbekcha)", value: ilm.title_uz },
      { label: "Sarlavha (Ruscha)", value: ilm.title_ru },
      { label: "Sarlavha (Arabcha)", value: ilm.title_arab },
      { label: "Matn (Inglizcha)", value: ilm.text_en, fullWidth: true },
      { label: "Matn (O'zbekcha)", value: ilm.text_uz, fullWidth: true },
      { label: "Matn (Ruscha)", value: ilm.text_ru, fullWidth: true },
      { label: "Matn (Arabcha)", value: ilm.text_arab, fullWidth: true },
      {
        label: "Bob",
        value:
          bobs.find((bob) => bob.id === ilm.bob_id)?.title_uz || "Noma'lum",
      },
    ];

    if (ilm.file_id && fileData) {
      fields.push({
        label: "Yuklanmalar",
        value: fileData.file_name,
        isFile: true,
        fileId: ilm.file_id,
        filePath: fileData.path,
        fileName: fileData.file_name,
        fullWidth: true,
      });
    }

    fields.push(
      {
        label: "Faol",
        value: ilm.is_active,
        render: (val) => (val ? "Ha" : "Yo'q"),
      },
      {
        label: "Yaratilgan vaqti",
        value: ilm.created_at,
        render: (val) => dateFormatted(val),
      },
      {
        label: "Yangilangan vaqti",
        value: ilm.updated_at,
        render: (val) => dateFormatted(val),
      }
    );

    return fields;
  };

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
    {
      name: "bob_id",
      label: "Bob",
      type: "searchable-select",
      required: true,
      placeholder: "Bob tanlang...",
      options: bobs.map((bob) => ({
        label: `${bob.title_uz} (${bob.title_en})`,
        value: bob.id,
      })),
      fullWidth: true,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Ilmlar</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors cursor-pointer"
        >
          <Plus size={20} />
          Yangi ilm qo'shish
        </button>
      </div>

      <TableFilter
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Qidirish (sarlavha, matn...)"
        disabled={loading}
      />

      {loading && ilmlar.length === 0 ? (
        <LoadingScreen />
      ) : error && ilmlar.length === 0 ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
          {loading && ilmlar.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          )}

          <Table
            columns={columns}
            data={ilmlar}
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

          {!loading && ilmlar.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {debouncedSearch
                ? "Hech qanday natija topilmadi"
                : "Ilmlar mavjud emas"}
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

      {selectedIlm && (
        <ViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Ilmni ko'rish: ${selectedIlm.title_en}`}
          fields={getViewFields(selectedIlm)}
        />
      )}

      {selectedIlm && (
        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={confirmDelete}
          title="Ilmni o'chirish"
          message={`Bu ilm o'chirilmoqda: "${selectedIlm.title_en}"? O'chirishni tasdiqlang.`}
          confirmLabel="O'chirish"
          cancelLabel="Bekor qilish"
          type="danger"
          loading={deleteLoading}
        />
      )}

      <FormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={isEditMode ? "Ilmni yangilash" : "Yangi ilm qo'shish"}
        fields={formFields}
        onSubmit={handleFormSubmit}
        submitLabel={isEditMode ? "Yangilash" : "Yaratish"}
        initialData={selectedIlm || {}}
      />
    </div>
  );
};

export default Ilm;
