import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Trash,
  Plus,
  Check,
  X,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export interface Answer {
  id: string;
  text_uz: string;
  text_ru: string;
  text_en: string;
  text_arab: string;
  is_correct?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  name_arab: string;
  answers?: Answer[];
  category?: {
    id: string;
    name_uz: string;
    name_ru?: string;
    name_en: string;
    name_arab?: string;
  };
  category_name?: string;
  name?: string;  // Added to match API type
  is_active?: boolean;
  created_at?: string;  // Made optional to match API type
  updated_at?: string;  // Made optional to match API type
  is_deleted?: boolean;
  deleted_at?: string | null;
}

export interface QuestionTableAction {
  label: string;
  onClick: (question: Question) => void;
  className?: string;
  icon?: React.ReactNode;
}

export interface AnswerFormData {
  text_uz: string;
  text_ru: string;
  text_en: string;
  text_arab: string;
  is_correct: boolean;
}

interface QuestionTableProps {
  questions: Question[];
  onQuestionEdit: (question: Question) => void;
  onQuestionDelete: (question: Question) => void;
  onQuestionView: (question: Question) => void;
  onAnswerEdit: (answerId: string, answer: Answer) => void;
  onAnswerDelete: (questionId: string, answer: Answer) => void;
  onAnswerAdd: (questionId: string, answerData: AnswerFormData) => void;
}

const QuestionTable: React.FC<QuestionTableProps> = ({
  questions,
  onQuestionEdit,
  onQuestionDelete,
  onQuestionView,
  onAnswerEdit,
  onAnswerDelete,
  onAnswerAdd,
}) => {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    null
  );
  const [addingAnswerForQuestion, setAddingAnswerForQuestion] = useState<
    string | null
  >(null);
  const [newAnswerData, setNewAnswerData] = useState<AnswerFormData>({
    text_uz: "",
    text_ru: "",
    text_en: "",
    text_arab: "",
    is_correct: false,
  });

  const toggleExpand = (questionId: string) => {
    setExpandedQuestionId(
      expandedQuestionId === questionId ? null : questionId
    );
    setAddingAnswerForQuestion(null); // Close add form when collapsing
  };

  const handleAddAnswer = (questionId: string) => {
    setAddingAnswerForQuestion(questionId);
    setNewAnswerData({
      text_uz: "",
      text_ru: "",
      text_en: "",
      text_arab: "",
      is_correct: false,
    });
  };

  const handleSaveNewAnswer = (questionId: string) => {
    if (!newAnswerData.text_uz || !newAnswerData.text_en) {
      toast("Please fill in required fields (UZ and EN)");
      return;
    }
    onAnswerAdd(questionId, newAnswerData);
    setAddingAnswerForQuestion(null);
    setNewAnswerData({
      text_uz: "",
      text_ru: "",
      text_en: "",
      text_arab: "",
      is_correct: false,
    });
  };

  const handleCancelAddAnswer = () => {
    setAddingAnswerForQuestion(null);
    setNewAnswerData({
      text_uz: "",
      text_ru: "",
      text_en: "",
      text_arab: "",
      is_correct: false,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-3 text-left w-10"></th>
            <th className="p-3 text-left font-semibold">Savol (EN)</th>
            <th className="p-3 text-left font-semibold">Savol (UZ)</th>
            <th className="p-3 text-left font-semibold">Kategoriya</th>
            <th className="p-3 text-left font-semibold">Javoblar</th>
            <th className="p-3 text-right font-semibold">Amallar</th>
          </tr>
        </thead>
        <tbody>
          {questions.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-500">
                Savollar topilmadi
              </td>
            </tr>
          ) : (
            questions.map((question) => {
              const isExpanded = expandedQuestionId === question.id;
              const answerCount = question.answers?.length || 0;
              const canAddAnswer = answerCount < 6;

              return (
                <>
                  {/* Question Row */}
                  <tr key={question.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <button
                        onClick={() => toggleExpand(question.id)}
                        className="hover:bg-gray-200 rounded p-1"
                      >
                        {isExpanded ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </button>
                    </td>
                    <td className="p-3 text-sm">{question.name_en || '-'}</td>
                    <td className="p-3 text-sm">{question.name_uz || '-'}</td>
                    <td className="p-3 text-sm">{question.category?.name_en || question.category_name || '-'}</td>
                    <td className="p-3 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {answerCount} javob
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onQuestionView(question)}
                          className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => onQuestionEdit(question)}
                          className="text-green-600 hover:bg-green-50 p-1 rounded"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => onQuestionDelete(question)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                          title="Delete"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Answers Section */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={6} className="bg-gray-50 p-4">
                        <div className="ml-8 space-y-2">
                          <h4 className="font-semibold text-sm mb-3">
                            Javoblar:
                          </h4>

                          {!question.answers || question.answers.length === 0 ? (
                            <div className="text-gray-500 text-sm py-2">
                              Javoblar mavjud emas
                            </div>
                          ) : (
                            question.answers.map((answer) => (
                              <div
                                key={answer.id}
                                className="bg-white border rounded-lg p-3 flex items-center justify-between"
                              >
                                <div className="flex-1 grid grid-cols-4 gap-4">
                                  <div>
                                    <span className="text-xs text-gray-500">
                                      UZ:
                                    </span>
                                    <p className="text-sm">{answer.text_uz}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">
                                      EN:
                                    </span>
                                    <p className="text-sm">{answer.text_en}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">
                                      RU:
                                    </span>
                                    <p className="text-sm">{answer.text_ru}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-gray-500">
                                      Arab:
                                    </span>
                                    <p className="text-sm">
                                      {answer.text_arab}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  {answer.is_correct && (
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                                      <Check size={14} /> To'g'ri
                                    </span>
                                  )}
                                  <button
                                    onClick={() =>
                                      onAnswerEdit(answer.id, answer)
                                    }
                                    className="text-green-600 hover:bg-green-50 p-1 rounded"
                                    title="Edit Answer"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      onAnswerDelete(question.id, answer)
                                    }
                                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                                    title="Delete Answer"
                                  >
                                    <Trash size={16} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}

                          {/* Add Answer Form */}
                          {addingAnswerForQuestion === question.id ? (
                            <div className="bg-white border-2 border-indigo-200 rounded-lg p-4 mt-3">
                              <h5 className="font-semibold text-sm mb-3">
                                Yangi javob qo'shish:
                              </h5>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <input
                                  type="text"
                                  placeholder="Javob (O'zbekcha) *"
                                  value={newAnswerData.text_uz}
                                  onChange={(e) =>
                                    setNewAnswerData({
                                      ...newAnswerData,
                                      text_uz: e.target.value,
                                    })
                                  }
                                  className="border rounded px-3 py-2 text-sm"
                                />
                                <input
                                  type="text"
                                  placeholder="Javob (Inglizcha) *"
                                  value={newAnswerData.text_en}
                                  onChange={(e) =>
                                    setNewAnswerData({
                                      ...newAnswerData,
                                      text_en: e.target.value,
                                    })
                                  }
                                  className="border rounded px-3 py-2 text-sm"
                                />
                                <input
                                  type="text"
                                  placeholder="Javob (Ruscha)"
                                  value={newAnswerData.text_ru}
                                  onChange={(e) =>
                                    setNewAnswerData({
                                      ...newAnswerData,
                                      text_ru: e.target.value,
                                    })
                                  }
                                  className="border rounded px-3 py-2 text-sm"
                                />
                                <input
                                  type="text"
                                  placeholder="Javob (Arabcha)"
                                  value={newAnswerData.text_arab}
                                  onChange={(e) =>
                                    setNewAnswerData({
                                      ...newAnswerData,
                                      text_arab: e.target.value,
                                    })
                                  }
                                  className="border rounded px-3 py-2 text-sm"
                                />
                              </div>
                              <label className="flex items-center gap-2 mb-3 text-sm">
                                <input
                                  type="checkbox"
                                  checked={newAnswerData.is_correct}
                                  onChange={(e) =>
                                    setNewAnswerData({
                                      ...newAnswerData,
                                      is_correct: e.target.checked,
                                    })
                                  }
                                  className="rounded"
                                />
                                To'g'ri javob
                              </label>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleSaveNewAnswer(question.id)
                                  }
                                  className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 text-sm flex items-center gap-1"
                                >
                                  <Check size={16} /> Saqlash
                                </button>
                                <button
                                  onClick={handleCancelAddAnswer}
                                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 text-sm flex items-center gap-1"
                                >
                                  <X size={16} /> Bekor qilish
                                </button>
                              </div>
                            </div>
                          ) : (
                            canAddAnswer && (
                              <button
                                onClick={() => handleAddAnswer(question.id)}
                                className="mt-3 flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded text-sm border border-indigo-200"
                              >
                                <Plus size={16} />
                                Javob qo'shish
                              </button>
                            )
                          )}

                          {!canAddAnswer &&
                            addingAnswerForQuestion !== question.id && (
                              <div className="mt-3 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded">
                                Maksimal 6 ta javob qo'shish mumkin
                              </div>
                            )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionTable;
