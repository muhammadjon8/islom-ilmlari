import { Edit, EyeIcon, Trash, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Table from "../components/table/Table";
import type { Column } from "../types/table.type";
import { yangiliklarApi, type YangiliklarType } from "../apis/news.api";
import type { FormField } from "../shared/components/FormModal";
import type { ViewField } from "../shared/components/ViewModal";
import ViewModal from "../shared/components/ViewModal";
import FormModal from "../shared/components/FormModal";
import ConfirmModal from "../shared/components/ConfirmModal";
import LoadingScreen from "../components/Loading";
import TablePagination from "../components/table/TablePagination";
import TableFilter from "../components/table/TableFilter";
import { toast } from "sonner";

const columns: Column<YangiliklarType>[] = [
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
    name: "description_en",
    label: "Tavsif (Inglizcha)",
    type: "textarea",
    required: true,
    placeholder: "Inglizcha tavsif kiriting...",
    fullWidth: true,
  },
  {
    name: "description_uz",
    label: "Tavsif (O'zbekcha)",
    type: "textarea",
    required: true,
    placeholder: "O'zbekcha tavsif kiriting...",
    fullWidth: true,
  },
  {
    name: "description_ru",
    label: "Tavsif (Ruscha)",
    type: "textarea",
    required: true,
    placeholder: "Ruscha tavsif kiriting...",
    fullWidth: true,
  },
  {
    name: "description_arab",
    label: "Tavsif (Arabcha)",
    type: "textarea",
    required: true,
    placeholder: "Arabcha tavsif kiriting...",
    fullWidth: true,
  },
  {
    name: "url",
    label: "URL",
    type: "url",
    required: true,
    placeholder: "Yangilik URL manzilini kiriting...",
    fullWidth: true,
  },
];

const Yangiliklar = () => {
  const [yangiliklar, setYangiliklar] = useState<YangiliklarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedYangilik, setSelectedYangilik] =
    useState<YangiliklarType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const PAGE_SIZE = 10;
  const { create, remove, update, getPaginated } = yangiliklarApi;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch yangiliklar with pagination
  const fetchYangiliklar = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaginated({
        page: currentPage,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setYangiliklar(response.items || []);
      setTotalPages(response.total_pages || 1);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Yangiliklarni yuklashda xatolik yuz berdi"
      );
      setYangiliklar([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYangiliklar();
  }, [currentPage, debouncedSearch]);

  const handleView = (row: YangiliklarType) => {
    setSelectedYangilik(row);
    setViewModalOpen(true);
  };

  const handleEdit = (row: YangiliklarType) => {
    setSelectedYangilik(row);
    setIsEditMode(true);
    setFormModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedYangilik(null);
    setIsEditMode(false);
    setFormModalOpen(true);
  };

  const handleDelete = (row: YangiliklarType) => {
    setSelectedYangilik(row);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedYangilik) return;

    try {
      setDeleteLoading(true);
      await remove(selectedYangilik.id);
      toast.success("Yangilik muvaffaqiyatli o'chirildi");
      await fetchYangiliklar(); // Refresh current page
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Yangilikni o'chirishda xatolik yuz berdi"
      );
    } finally {
      setDeleteLoading(false);
      setConfirmModalOpen(false);
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      if (isEditMode && selectedYangilik) {
        await update(selectedYangilik.id, data);
        toast.success("Yangilik muvaffaqiyatli yangilandi");
      } else {
        await create(data as any);
        toast.success("Yangilik muvaffaqiyatli yaratildi");
        setCurrentPage(1); // Go to first page to see new item
      }
      setFormModalOpen(false);
      await fetchYangiliklar();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Yangilikni saqlashda xatolik yuz berdi"
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

  const getViewFields = (yangilik: YangiliklarType): ViewField[] => {
    const fields: ViewField[] = [
      { label: "ID", value: yangilik.id },
      { label: "Sarlavha (Inglizcha)", value: yangilik.title_en },
      { label: "Sarlavha (O'zbekcha)", value: yangilik.title_uz },
      { label: "Sarlavha (Ruscha)", value: yangilik.title_ru },
      { label: "Sarlavha (Arabcha)", value: yangilik.title_arab },
      {
        label: "Tavsif (Inglizcha)",
        value: yangilik.description_en,
        fullWidth: true,
      },
      {
        label: "Tavsif (O'zbekcha)",
        value: yangilik.description_uz,
        fullWidth: true,
      },
      {
        label: "Tavsif (Ruscha)",
        value: yangilik.description_ru,
        fullWidth: true,
      },
      {
        label: "Tavsif (Arabcha)",
        value: yangilik.description_arab,
        fullWidth: true,
      },
      {
        label: "URL",
        value: yangilik.url || "Belgilangan emas",
        fullWidth: true,
      },
    ];

    fields.push(
      {
        label: "Faol",
        value: yangilik.is_active,
        render: (val) => (val ? "Ha" : "Yo'q"),
      },
      {
        label: "Yaratilgan vaqti",
        value: new Date(parseInt(yangilik.created_at)).toLocaleString(),
      },
      {
        label: "Yangilangan vaqti",
        value: new Date(parseInt(yangilik.updated_at)).toLocaleString(),
      }
    );

    return fields;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Yangiliklar</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors cursor-pointer"
        >
          <Plus size={20} />
          Yangi yangilik qo'shish
        </button>
      </div>

      <TableFilter
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Qidirish (sarlavha, tavsif...)"
        disabled={loading}
      />

      {loading && yangiliklar.length === 0 ? (
        <LoadingScreen />
      ) : error && yangiliklar.length === 0 ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
          {loading && yangiliklar.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          )}

          <Table
            columns={columns}
            data={yangiliklar}
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

          {!loading && yangiliklar.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {debouncedSearch
                ? "Hech qanday natija topilmadi"
                : "Yangiliklar mavjud emas"}
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

      {selectedYangilik && (
        <ViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Yangilikni ko'rish: ${selectedYangilik.title_en}`}
          fields={getViewFields(selectedYangilik)}
        />
      )}

      {selectedYangilik && (
        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={confirmDelete}
          title="Yangilikni o'chirish"
          message={`Bu yangilik o'chirilmoqda: "${selectedYangilik.title_en}"? O'chirishni tasdiqlang.`}
          confirmLabel="O'chirish"
          cancelLabel="Bekor qilish"
          type="danger"
          loading={deleteLoading}
        />
      )}

      <FormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={isEditMode ? "Yangilikni yangilash" : "Yangi yangilik qo'shish"}
        fields={formFields}
        onSubmit={handleFormSubmit}
        submitLabel={isEditMode ? "Yangilash" : "Yaratish"}
        initialData={selectedYangilik || {}}
      />
    </div>
  );
};

export default Yangiliklar;
