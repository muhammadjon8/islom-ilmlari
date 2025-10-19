import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import QuestionTable from "../components/table/QuestionTable";
import type {
  Question,
  Answer,
  AnswerFormData,
} from "../components/table/QuestionTable";
import type { FormField } from "../shared/components/FormModal";
import type { ViewField } from "../shared/components/ViewModal";
import ViewModal from "../shared/components/ViewModal";
import FormModal from "../shared/components/FormModal";
import ConfirmModal from "../shared/components/ConfirmModal";
import LoadingScreen from "../components/Loading";
import TablePagination from "../components/table/TablePagination";
import TableFilter from "../components/table/TableFilter";
import { toast } from "sonner";
import { questionsApi } from "../apis/questions.api";
import { categoryApi, type Category } from "../apis/category.api";
import { answerApi } from "../apis/answers.api";
import { dateFormatted } from "../shared/utils/dateFormatted";
import QuestionFormModal from "../components/questions/QuestionsFormModal";

const Savollar = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Search state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const PAGE_SIZE = 10;

  // Question Modals
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Answer Modals
  const [answerFormModalOpen, setAnswerFormModalOpen] = useState(false);
  const [answerConfirmModalOpen, setAnswerConfirmModalOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [selectedQuestionForAnswer, setSelectedQuestionForAnswer] = useState<
    string | null
  >(null);
  const [isEditAnswerMode, setIsEditAnswerMode] = useState(false);

  const { create, remove, update, getPaginated } = questionsApi;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPaginated({
        page: currentPage,
        page_size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setQuestions(data.items);
      setTotalPages(data.total_pages);
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
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Question Handlers
  const handleView = (question: Question) => {
    setViewModalOpen(true);
    setSelectedQuestion(question);
  };

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setIsEditMode(true);
    setFormModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedQuestion(null);
    setIsEditMode(false);
    setFormModalOpen(true);
  };

  const handleDelete = (question: Question) => {
    setSelectedQuestion(question);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedQuestion) return;
    setDeleteLoading(true);
    try {
      await remove(selectedQuestion.id);
      toast.success("Question deleted successfully");
      await fetchQuestions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete question");
    } finally {
      setDeleteLoading(false);
      setConfirmModalOpen(false);
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      if (isEditMode && selectedQuestion) {
        await update(selectedQuestion.id, data);
        toast.success("Question updated successfully");
      } else {
        await create(data as any);
        toast.success("Question created successfully");
        setCurrentPage(1);
      }
      await fetchQuestions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save question");
      throw err;
    }
  };

  const handleAnswerAdd = async (
    questionId: string,
    answerData: AnswerFormData
  ) => {
    console.log("Adding answer for question:", questionId, answerData);
    try {
      await answerApi.create({
        ...answerData,
        question_id: questionId,
      });
      toast.success("Answer added successfully");
      await fetchQuestions();
    } catch (err: any) {
      toast.error("Failed to add answer");
    }
  };

  const handleAnswerEdit = (questionId: string, answer: Answer) => {
    setSelectedQuestionForAnswer(questionId);
    setSelectedAnswer(answer);
    setIsEditAnswerMode(true);
    setAnswerFormModalOpen(true);
  };

  const handleAnswerDelete = (questionId: string, answer: Answer) => {
    setSelectedQuestionForAnswer(questionId);
    setSelectedAnswer(answer);
    setAnswerConfirmModalOpen(true);
  };

  const confirmAnswerDelete = async () => {
    if (!selectedAnswer || !selectedQuestionForAnswer) return;

    setDeleteLoading(true);

    try {
      await answerApi.remove(selectedAnswer.id);

      // Update the local state directly without refetching all questions
      setQuestions((prevQuestions) =>
        prevQuestions.map((question) => {
          if (question.id === selectedQuestionForAnswer) {
            return {
              ...question,
              answers: question.answers?.filter(
                (a) => a.id !== selectedAnswer.id
              ),
            };
          }
          return question;
        })
      );

      toast.success("Answer deleted successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete answer");
    } finally {
      setDeleteLoading(false);
      setAnswerConfirmModalOpen(false);
      setSelectedAnswer(null);
      setSelectedQuestionForAnswer(null);
    }
  };

  const handleAnswerFormSubmit = async (data: Record<string, any>) => {
    try {
      if (isEditAnswerMode && selectedAnswer && selectedQuestionForAnswer) {
        await answerApi.update(selectedAnswer.id, data);
        console.log("Updating answer:", selectedAnswer.id, data);
        toast.success("Answer updated successfully");
      }
      await fetchQuestions();
    } catch (err: any) {
      toast.error("Failed to save answer");
      throw err;
    }
  };

  const answerFormFields: FormField[] = [
    {
      name: "text_uz",
      label: "Javob (O'zbekcha)",
      type: "text",
      required: true,
      placeholder: "O'zbekcha javob kiriting...",
    },
    {
      name: "text_en",
      label: "Javob (Inglizcha)",
      type: "text",
      required: true,
      placeholder: "Inglizcha javob kiriting...",
    },
    {
      name: "text_ru",
      label: "Javob (Ruscha)",
      type: "text",
      required: true,
      placeholder: "Ruscha javob kiriting...",
    },
    {
      name: "text_arab",
      label: "Javob (Arabcha)",
      type: "text",
      required: true,
      placeholder: "Arabcha javob kiriting...",
    },
    {
      name: "is_correct",
      label: "To'g'ri javob",
      type: "checkbox",
      required: false,
    },
  ];

  const getViewFields = (question: Question): ViewField[] => [
    { label: "ID", value: question.id },
    { label: "Savol (Inglizcha)", value: question.name_en },
    { label: "Savol (O'zbekcha)", value: question.name_uz },
    { label: "Savol (Ruscha)", value: question.name_ru },
    { label: "Savol (Arabcha)", value: question.name_arab },
    {
      label: "Kategoriya",
      value: `${question.category?.name_uz} (${question.category?.name_en}`,
    },
    {
      label: "Active",
      value: question.is_active,
      render: (val) => (val ? "Yes" : "No"),
    },
    { label: "Javoblar soni", value: question.answers?.length.toString() },
    {
      label: "Yaratilgan vaqti",
      value: question.created_at,
      render: (val) => dateFormatted(val),
    },
    {
      label: "Yangilangan vaqti",
      value: question.updated_at,
      render: (val) => dateFormatted(val),
    },
  ];

  if (loading && questions.length === 0) {
    return <LoadingScreen />;
  }

  if (error && questions.length === 0) {
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
          className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors"
        >
          <Plus size={20} />
          Yangi savol qo'shish
        </button>
      </div>

      {/* Search Filter */}
      <TableFilter
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Qidirish (savol nomi...)"
        disabled={loading}
      />

      {/* Loading Overlay */}
      {loading && questions.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Question Table with Expandable Answers */}
      <QuestionTable
        questions={questions}
        onQuestionEdit={handleEdit}
        onQuestionDelete={handleDelete}
        onQuestionView={handleView}
        onAnswerEdit={handleAnswerEdit}
        onAnswerDelete={(questionId, answer) =>
          handleAnswerDelete(questionId, answer)
        }
        onAnswerAdd={handleAnswerAdd}
      />

      {/* No Results */}
      {!loading && questions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {debouncedSearch
            ? "Hech qanday natija topilmadi"
            : "Savollar mavjud emas"}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          disabled={loading}
        />
      )}

      {/* Question View Modal */}
      {selectedQuestion && (
        <ViewModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Savolni ko'rish: ${selectedQuestion.name_en}`}
          fields={getViewFields(selectedQuestion)}
        />
      )}

      {/* Question Delete Confirmation */}
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

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={isEditMode ? "Savolni yangilash" : "Yangi savol qo'shish"}
        onSubmit={handleFormSubmit}
        submitLabel={isEditMode ? "Yangilash" : "Yaratish"}
        initialData={selectedQuestion || {}}
        categories={categories}
      />

      {/* Answer Form Modal */}
      <FormModal
        isOpen={answerFormModalOpen}
        onClose={() => setAnswerFormModalOpen(false)}
        title="Javobni yangilash"
        fields={answerFormFields}
        onSubmit={handleAnswerFormSubmit}
        submitLabel="Yangilash"
        initialData={selectedAnswer || {}}
      />

      {/* Answer Delete Confirmation */}
      {selectedAnswer && (
        <ConfirmModal
          isOpen={answerConfirmModalOpen}
          onClose={() => setAnswerConfirmModalOpen(false)}
          onConfirm={confirmAnswerDelete}
          title="Javobni o'chirish"
          message={`Bu javob o'chirilmoqda: "${selectedAnswer.text_uz}"? O'chirishni tasdiqlang.`}
          confirmLabel="O'chirish"
          cancelLabel="Bekor qilish"
          type="danger"
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default Savollar;
