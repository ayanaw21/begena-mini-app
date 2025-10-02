// src/components/ImageModal.tsx
"use client";
import React from "react";
import Image from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  imageUrl,
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90%] max-h-[90%]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt="Screenshot"
          width={800}
          height={600}
          className="max-w-full max-h-full rounded shadow-lg object-contain"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-2xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
