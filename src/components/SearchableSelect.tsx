import React, { useState, useRef, useEffect } from "react";
import { Search, X, Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  error,
  label,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery("");
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Main Input/Button */}
      <div
        className={`relative w-full px-3 py-2 border rounded-lg bg-white cursor-text transition-all ${
          isOpen
            ? "ring-2 ring-indigo-500 border-indigo-500"
            : error
            ? "border-red-500"
            : "border-gray-300 hover:border-gray-400"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        onClick={() => !disabled && setIsOpen(true)}
      >
        <div className="flex items-center gap-2">
          {/* Search Icon */}
          <Search size={16} className="text-gray-400 flex-shrink-0" />

          {/* Input or Selected Value */}
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Qidirish..."
              className="flex-1 outline-none bg-transparent text-sm"
              disabled={disabled}
            />
          ) : (
            <div className="flex-1 text-sm truncate">
              {selectedOption ? (
                <span className="text-gray-900">{selectedOption.label}</span>
              ) : (
                <span className="text-gray-400">{placeholder}</span>
              )}
            </div>
          )}

          {/* Clear or Dropdown Icon */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                tabIndex={-1}
              >
                <X size={14} className="text-gray-500" />
              </button>
            )}
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-8 text-center text-gray-500 text-sm">
                <div className="mb-2">😕</div>
                Hech narsa topilmadi
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-3 py-2 text-left transition-colors flex items-start justify-between gap-2 ${
                    index === highlightedIndex
                      ? "bg-indigo-50"
                      : "hover:bg-gray-50"
                  } ${
                    value === option.value
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-900"
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {option.label}
                    </div>
                  </div>
                  {value === option.value && (
                    <Check size={16} className="flex-shrink-0 mt-0.5" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer with count */}
          {filteredOptions.length > 0 && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              {filteredOptions.length} ta natija
              {searchQuery && " topildi"}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default SearchableSelect;
