"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface EditModalProps<T> {
  isOpen: boolean;
  data: T | null;
  formData: T | null;
  setFormData: (data: T) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  renderFields: (formData: T, setFormData: (data: T) => void) => React.ReactNode;
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit"
      className="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">{renderFields(formData, setFormData)}</div>
    </Modal>
  );
}
