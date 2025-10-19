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
import TablePagination from "../components/table/TablePagination";
import TableFilter from "../components/table/TableFilter";
import { toast } from "sonner";
import { categoryApi, type Category } from "../apis/category.api";
import { dateFormatted } from "../shared/utils/dateFormatted";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const PAGE_SIZE = 10;
  const { create, remove, update, getPaginated } = categoryApi;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch categories with pagination
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPaginated({
        page: currentPage,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });

      setCategories(response.items || []);
      setTotalPages(response.total_pages || 1);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Kategoriyalarni yuklashda xatolik yuz berdi"
      );
      setCategories([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, [currentPage, debouncedSearch]);

  const handleView = (row: Category) => {
    setSelectedCategory(row);
    setViewModalOpen(true);
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

    try {
      setDeleteLoading(true);
      await remove(selectedCategory.id);
      toast.success("Kategoriya muvaffaqiyatli o'chirildi");
      setCurrentPage(1); // Reset to first page after deletion
      setConfirmModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Kategoriyani o'chirishda xatolik yuz berdi"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      if (isEditMode && selectedCategory) {
        await update(selectedCategory.id, data);
        toast.success("Kategoriya muvaffaqiyatli yangilandi");
      } else {
        await create(data as any);
        toast.success("Kategoriya muvaffaqiyatli yaratildi");
        setCurrentPage(1); // Go to first page to see new item
      }
      setFormModalOpen(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Kategoriyani saqlashda xatolik yuz berdi"
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

  const getViewFields = (category: Category): ViewField[] => [
    { label: "ID", value: category.id },
    { label: "Nomi (Inglizcha)", value: category.name_en },
    { label: "Nomi (O'zbekcha)", value: category.name_uz },
    { label: "Nomi (Ruscha)", value: category.name_ru },
    { label: "Nomi (Arabcha)", value: category.name_arab },
    {
      label: "Faol",
      value: category.is_active,
      render: (val) => (val ? "Ha" : "Yo'q"),
    },
    {
      label: "Yaratilgan vaqti",
      value: category.created_at,
      render: (val) => dateFormatted(val),
    },
    {
      label: "Yangilangan vaqti",
      value: category.updated_at,
      render: (val) => dateFormatted(val),
    },
  ];

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

      <TableFilter
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Qidirish (nom, tavsif...)"
        disabled={loading}
      />

      {loading && categories.length === 0 ? (
        <LoadingScreen />
      ) : error && categories.length === 0 ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <>
          {loading && categories.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          )}

          <Table
            columns={columns}
            data={categories}
            filterKey="name_en"
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

          {!loading && categories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {debouncedSearch
                ? "Hech qanday natija topilmadi"
                : "Kategoriyalar mavjud emas"}
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

      {selectedCategory && (
        <ViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Kategoriyani ko'rish: ${selectedCategory.name_en}`}
          fields={getViewFields(selectedCategory)}
        />
      )}

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
