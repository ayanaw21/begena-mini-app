// src/components/EditModal.tsx
"use client";
import React from "react";

interface EditModalProps<T> {
  isOpen: boolean;
  data: T | null;
  formData: T | null;
  setFormData: (data: T) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  renderFields: (formData: T, setFormData: (data: T) => void) => JSX.Element;
}

export default function EditModal<T>({
  isOpen,
  data,
  formData,
  setFormData,
  onClose,
  onSubmit,
  renderFields,
}: EditModalProps<T>) {
  if (!isOpen || !data || !formData) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="relative bg-gray-800 bg-opacity-95 p-6 rounded-lg shadow-xl w-96 z-10 animate-fadeIn">
        <h2 className="text-xl font-bold mb-4 text-white">Edit</h2>
        <div className="flex flex-col gap-2 mb-4">
          {renderFields(formData, setFormData)}
        </div>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-600 rounded text-white hover:bg-gray-500 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-500 transition"
            onClick={onSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
