import { Edit, EyeIcon, Trash, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Table from "../components/table/Table";
import type { Column } from "../types/table.type";
import { quranIlmBobApi, type BobType } from "../apis/bob.api";
import type { FormField } from "../shared/components/FormModal";
import type { ViewField } from "../shared/components/ViewModal";
import ViewModal from "../shared/components/ViewModal";
import FormModal from "../shared/components/FormModal";
import ConfirmModal from "../shared/components/ConfirmModal";
import LoadingScreen from "../components/Loading";
import TablePagination from "../components/table/TablePagination";
import TableFilter from "../components/table/TableFilter";
import { toast } from "sonner";

const columns: Column<BobType>[] = [
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
];

const QuranIlmBob = () => {
  const [boblar, setBoblar] = useState<BobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedBob, setSelectedBob] = useState<BobType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const PAGE_SIZE = 10;
  const { create, remove, update, getPaginated } = quranIlmBobApi;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch boblar with pagination
  const fetchBoblar = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaginated({
        page: currentPage,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setBoblar(response.items || []);
      setTotalPages(response.total_pages || 1);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Qur'an ilm boblarini yuklashda xatolik yuz berdi"
      );
      setBoblar([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoblar();
  }, [currentPage, debouncedSearch]);

  const handleView = (row: BobType) => {
    setSelectedBob(row);
    setViewModalOpen(true);
  };

  const handleEdit = (row: BobType) => {
    setSelectedBob(row);
    setIsEditMode(true);
    setFormModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedBob(null);
    setIsEditMode(false);
    setFormModalOpen(true);
  };

  const handleDelete = (row: BobType) => {
    setSelectedBob(row);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBob) return;

    try {
      setDeleteLoading(true);
      await remove(selectedBob.id);
      toast.success("Qur'an ilm bobi muvaffaqiyatli o'chirildi");
      setCurrentPage(1); // Reset to first page after deletion
      setConfirmModalOpen(false);
      await fetchBoblar();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Qur'an ilm bobini o'chirishda xatolik yuz berdi"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      if (isEditMode && selectedBob) {
        await update(selectedBob.id, data);
        toast.success("Qur'an ilm bobi muvaffaqiyatli yangilandi");
      } else {
        await create(data as any);
        toast.success("Qur'an ilm bobi muvaffaqiyatli yaratildi");
        setCurrentPage(1); // Go to first page to see new item
      }
      setFormModalOpen(false);
      await fetchBoblar();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Qur'an ilm bobini saqlashda xatolik yuz berdi"
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

  const getViewFields = (bob: BobType): ViewField[] => {
    const fields: ViewField[] = [
      { label: "ID", value: bob.id },
      { label: "Sarlavha (Inglizcha)", value: bob.title_en },
      { label: "Sarlavha (O'zbekcha)", value: bob.title_uz },
      { label: "Sarlavha (Ruscha)", value: bob.title_ru },
      { label: "Sarlavha (Arabcha)", value: bob.title_arab },
      {
        label: "Faol",
        value: bob.is_active,
        render: (val) => (val ? "Ha" : "Yo'q"),
      },
      {
        label: "Yaratilgan vaqti",
        value: new Date(parseInt(bob.created_at)).toLocaleString(),
      },
      {
        label: "Yangilangan vaqti",
        value: new Date(parseInt(bob.updated_at)).toLocaleString(),
      },
    ];

    return fields;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Qur'an Ilm Boblari</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors cursor-pointer"
        >
          <Plus size={20} />
          Yangi Qur'an ilm bobi qo'shish
        </button>
      </div>

      <TableFilter
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Qidirish (sarlavha...)"
        disabled={loading}
      />

      {loading && boblar.length === 0 ? (
        <LoadingScreen />
      ) : error && boblar.length === 0 ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
          {loading && boblar.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          )}

          <Table
            columns={columns}
            data={boblar}
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

          {!loading && boblar.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {debouncedSearch
                ? "Hech qanday natija topilmadi"
                : "Qur'an ilm boblari mavjud emas"}
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

      {selectedBob && (
        <ViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Qur'an ilm bobini ko'rish: ${selectedBob.title_en}`}
          fields={getViewFields(selectedBob)}
        />
      )}

      {selectedBob && (
        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={confirmDelete}
          title="Qur'an ilm bobini o'chirish"
          message={`Bu Qur'an ilm bobi o'chirilmoqda: "${selectedBob.title_en}"? O'chirishni tasdiqlang.`}
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
          isEditMode
            ? "Qur'an ilm bobini yangilash"
            : "Yangi Qur'an ilm bobi qo'shish"
        }
        fields={formFields}
        onSubmit={handleFormSubmit}
        submitLabel={isEditMode ? "Yangilash" : "Yaratish"}
        initialData={selectedBob || {}}
      />
    </div>
  );
};

export default QuranIlmBob;
