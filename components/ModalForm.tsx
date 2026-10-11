"use client";
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

import { SiteImage } from "@/lib/images";

interface ModalFormProps {
  title: string;
  children?: ReactNode;
  onSubmit: () => void | Promise<void>;
  triggerText?: string;
  image?: SiteImage;
}

export default function ModalForm({
  title,
  children,
  onSubmit,
  triggerText,
  image,
}: ModalFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onSubmit();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{triggerText || title}</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        image={image}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </>
        }
      >
        {children && <div className="space-y-4">{children}</div>}
      </Modal>
    </>
  );
}
