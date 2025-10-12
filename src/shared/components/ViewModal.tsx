import { X, EyeIcon } from "lucide-react";
import { useEffect } from "react";
import { downloadFile, getFileUrl } from "../../apis/file-upload.api";
import { toast } from "sonner";

export interface ViewField {
  label: string;
  value: string | number | boolean | null | undefined;
  render?: (value: any) => React.ReactNode;
  fullWidth?: boolean;
  isFile?: boolean;
  filePath?: string;
  fileName?: string;
  fileId?: string;
}

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: ViewField[];
}

const ViewModal = ({ isOpen, onClose, title, fields }: ViewModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const handleDownload = async (filePath: string) => {
    try {
      await downloadFile(filePath);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field, index) => (
              <div
                key={index}
                className={`${
                  field.fullWidth ? "md:col-span-2" : ""
                } bg-gray-50 p-4 rounded-lg`}
              >
                <label className="text-sm font-medium text-gray-600 block mb-1">
                  {field.label}
                </label>
                <div className="text-base text-gray-900 break-words">
                  {field.isFile && field.fileId ? (
                    <div className="flex items-center gap-3 flex-col">
                      {field.filePath &&
                      (field.filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                        field.fileName?.match(
                          /\.(jpg|jpeg|png|gif|webp)$/i
                        )) ? (
                        <img
                          src={getFileUrl(field.filePath)}
                          alt={field.fileName || "File"}
                          className="max-w-2xl max-h-20 object-cover rounded border"
                        />
                      ) : null}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {field.fileName || "File attached"}
                        </p>
                        <button
                          onClick={() =>
                            handleDownload(field.filePath || "download")
                          }
                          className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <EyeIcon size={16} />
                          View File
                        </button>
                      </div>
                    </div>
                  ) : field.render ? (
                    field.render(field.value)
                  ) : (
                    formatValue(field.value)
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-300 pb-4 bg-gray-50 mr-4">
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
