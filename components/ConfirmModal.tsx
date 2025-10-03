"use client";
import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      {/* Light transparent blurred background */}
      <div
        className="absolute inset-0 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      ></div>
      {/* Modal content */}
      <div className="relative bg-gray-800 bg-opacity-90 p-6 rounded-lg shadow-xl w-full max-w-md z-10 animate-fadeIn">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-white">
          {title}
        </h2>
        <p className="mb-6 text-white text-sm sm:text-base">{message}</p>
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            className="px-4 py-2 bg-gray-600 rounded text-white hover:bg-gray-500 transition"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 rounded text-white hover:bg-red-500 transition"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
