"use client";
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";

interface ModalFormProps {
  title: string;
  children?: ReactNode;
  onSubmit: () => void | Promise<void>;
  triggerText?: string;
}

export default function ModalForm({
  title,
  children,
  onSubmit,
  triggerText,
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
      <Button
        className="mb-4 bg-amber-600 hover:bg-amber-700"
        onClick={() => setIsOpen(true)}
      >
        {triggerText || title}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-amber-400 text-lg sm:text-xl font-bold mb-4">
              {title}
            </h2>

            {children && <div className="space-y-4">{children}</div>}

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-2 mt-4">
              <Button
                onClick={() => setIsOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
