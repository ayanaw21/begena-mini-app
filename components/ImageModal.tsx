// src/components/ImageModal.tsx
"use client";
import React from "react";
import Image from "next/image";
import { X } from "lucide-react";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt="Payment receipt"
          width={1200}
          height={900}
          className="max-h-[90vh] w-auto rounded-lg border border-white/10 object-contain shadow-2xl"
        />
        <button
          onClick={onClose}
          aria-label="Close"
          className="bg-background/80 hover:text-primary absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/10 backdrop-blur transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
