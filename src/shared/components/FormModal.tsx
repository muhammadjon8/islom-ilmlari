import { X, Upload, File, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  deleteFile,
  getFileById,
  getFileUrl,
  uploadFile,
  type FileData,
} from "../../apis/file-upload.api";
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "number"
    | "textarea"
    | "select"
    | "checkbox"
    | "date"
    | "file";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string | number }[];
  fullWidth?: boolean;
  defaultValue?: any;
  accept?: string; // For file input (e.g., "image/*" or ".pdf,.doc,.docx")
  fileType?: "image" | "document"; // To determine preview behavior
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  submitLabel?: string;
  initialData?: Record<string, any>;
}
const FormModal = ({
  isOpen,
  onClose,
  title,
  fields,
  onSubmit,
  submitLabel = "Submit",
  initialData = {},
}: FormModalProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>(
    {}
  );
  const [fileData, setFileData] = useState<Record<string, FileData>>({});
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileUpload = async (fieldName: string, file: File) => {
    setUploadingFiles((prev) => ({ ...prev, [fieldName]: true }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });

    try {
      const uploadedFile = await uploadFile(file);
      setFileData((prev) => ({ ...prev, [fieldName]: uploadedFile }));
      setFormData((prev) => ({ ...prev, [fieldName]: uploadedFile.id }));
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error.response?.data?.message || "Failed to upload file",
      }));
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleFileRemove = async (fieldName: string) => {
    const fileId = formData[fieldName];
    if (fileId && typeof fileId === "string") {
      try {
        await deleteFile(fileId);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
    setFormData((prev) => {
      const newData = { ...prev };
      delete newData[fieldName];
      return newData;
    });
    setFileData((prev) => {
      const newData = { ...prev };
      delete newData[fieldName];
      return newData;
    });
  };

  useEffect(() => {
    if (isOpen) {
      const initial = fields.reduce((acc, field) => {
        acc[field.name] = initialData[field.name] ?? field.defaultValue ?? "";
        return acc;
      }, {} as Record<string, any>);
      setFormData(initial);
      setErrors({});

      // Fetch file data for existing files
      const fetchExistingFiles = async () => {
        const fileFields = fields.filter((f) => f.type === "file");
        const newFileData: Record<string, FileData> = {};

        for (const field of fileFields) {
          const fileId = initialData[field.name];
          if (fileId && typeof fileId === "string") {
            try {
              const file = await getFileById(fileId);
              newFileData[field.name] = file;
            } catch (error) {
              console.error(`Failed to fetch file for ${field.name}:`, error);
            }
          }
        }

        if (Object.keys(newFileData).length > 0) {
          setFileData(newFileData);
        }
      };

      fetchExistingFiles();
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, fields, initialData]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, loading, onClose]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/50"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => (
                <div
                  key={field.name}
                  className={field.fullWidth ? "md:col-span-2" : ""}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[field.name]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={loading}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[field.name]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={loading}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData[field.name] || false}
                        onChange={(e) =>
                          handleChange(field.name, e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        disabled={loading}
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {field.placeholder}
                      </span>
                    </div>
                  ) : field.type === "file" ? (
                    <div>
                      {!formData[field.name] ? (
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={field.name}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                              uploadingFiles[field.name]
                                ? "border-gray-300 bg-gray-50"
                                : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                            }`}
                          >
                            <Upload size={20} />
                            <span>
                              {uploadingFiles[field.name]
                                ? "Uploading..."
                                : field.placeholder || "Choose file"}
                            </span>
                          </label>
                          <input
                            id={field.name}
                            type="file"
                            accept={field.accept}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(field.name, file);
                            }}
                            className="hidden"
                            disabled={loading || uploadingFiles[field.name]}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          {field.fileType === "image" &&
                          fileData[field.name]?.path ? (
                            <img
                              src={getFileUrl(fileData[field.name].path)}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <File size={32} className="text-gray-400" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {fileData[field.name]?.file_name ||
                                "File uploaded"}
                            </p>
                            {fileData[field.name]?.size && (
                              <p className="text-xs text-gray-500">
                                {(fileData[field.name].size / 1024).toFixed(2)}{" "}
                                KB
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFileRemove(field.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            disabled={loading}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[field.name]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      disabled={loading}
                    />
                  )}

                  {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
