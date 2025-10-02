"use client";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import api from "@/lib/api";
import DataTable from "@/components/DataTable";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import toast from "react-hot-toast";
import { Payment } from "@/types";
import ImageModal from "@/components/ImageModal";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // CRUD button states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPayments(res.data.payments);
    } catch {
      toast.error("Failed to fetch payments");
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const uniqueSections = Array.from(new Set(payments.map((p) => p.section)));
  const uniqueBatches = Array.from(new Set(payments.map((p) => p.batch)));
  const uniqueMonths = Array.from(new Set(payments.map((p) => p.month)));

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.begenaId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection = filterSection ? p.section === filterSection : true;
      const matchesBatch = filterBatch ? p.batch === filterBatch : true;
      const matchesMonth = filterMonth ? p.month === filterMonth : true;
      return matchesSearch && matchesSection && matchesBatch && matchesMonth;
    });
  }, [payments, searchQuery, filterSection, filterBatch, filterMonth]);

  // DELETE payment
  const handleDelete = async () => {
    if (!paymentToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/payments/${paymentToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPayments((prev) => prev.filter((p) => p._id !== paymentToDelete._id));
      toast.success("Payment deleted successfully");
      setDeleteModalOpen(false);
      setPaymentToDelete(null);
    } catch {
      toast.error("Failed to delete payment");
    } finally {
      setIsDeleting(false);
    }
  };

  // EDIT payment
  const handleEdit = async (updatedPayment: Payment) => {
    if (!paymentToEdit) return;
    setIsEditing(true);
    try {
      await api.put(`/payments/${paymentToEdit._id}`, updatedPayment, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setPayments((prev) =>
        prev.map((p) => (p._id === paymentToEdit._id ? updatedPayment : p))
      );
      toast.success("Payment updated successfully");
      setEditModalOpen(false);
      setPaymentToEdit(null);
    } catch {
      toast.error("Failed to update payment");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div>
      <h1 className="text-amber-400 text-2xl font-bold mb-4">Payments</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by Name or ID"
          className="p-2 rounded bg-gray-700 text-white flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
        >
          <option value="">All Sections</option>
          {uniqueSections.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>
        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={filterBatch}
          onChange={(e) => setFilterBatch(e.target.value)}
        >
          <option value="">All Batches</option>
          {uniqueBatches.map((batch) => (
            <option key={batch} value={batch}>
              {batch}
            </option>
          ))}
        </select>
        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="">All Months</option>
          {uniqueMonths.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={[
          { key: "fullName", label: "Full Name" },
          { key: "begenaId", label: "Begena ID" },
          { key: "section", label: "Section" },
          { key: "month", label: "Month" },
          { key: "batch", label: "Batch" },
          { key: "screenshot", label: "Screenshot" },
          { key: "actions", label: "Actions" },
        ]}
        data={filteredPayments.map((p) => ({
          ...p,
          screenshot: (
            <div
              className="w-20 h-20 cursor-pointer"
              onClick={() => {
                setSelectedImage(p.screenshot);
                setImageModalOpen(true);
              }}
            >
              <Image
                src={p.screenshot}
                alt="Screenshot"
                width={80}
                height={80}
                className="object-cover rounded border"
              />
            </div>
          ),
          actions: (
            <div className="flex gap-2">
              <button
                type="button"
                className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                disabled={isEditing && paymentToEdit?._id === p._id}
                onClick={() => {
                  setPaymentToEdit(p);
                  setEditModalOpen(true);
                }}
              >
                {isEditing && paymentToEdit?._id === p._id
                  ? "Editing..."
                  : "Edit"}
              </button>
              <button
                type="button"
                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                disabled={isDeleting && paymentToDelete?._id === p._id}
                onClick={() => {
                  setPaymentToDelete(p);
                  setDeleteModalOpen(true);
                }}
              >
                {isDeleting && paymentToDelete?._id === p._id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          ),
        }))}
      />

      <ImageModal
        isOpen={imageModalOpen}
        imageUrl={selectedImage}
        onClose={() => setImageModalOpen(false)}
      />

      {paymentToEdit && (
        <EditModal
          isOpen={editModalOpen}
          data={paymentToEdit}
          formData={paymentToEdit}
          setFormData={(update: React.SetStateAction<Payment>) =>
            setPaymentToEdit((prev) =>
              typeof update === "function" ? update(prev as Payment) : update
            )
          }
          onClose={() => setEditModalOpen(false)}
          onSubmit={() => handleEdit(paymentToEdit)}
          renderFields={(data: Payment, setData: (p: Payment) => void) => (
            <>
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Full Name"
                value={data.fullName}
                onChange={(e) => setData({ ...data, fullName: e.target.value })}
              />
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Begena ID"
                value={data.begenaId}
                onChange={(e) => setData({ ...data, begenaId: e.target.value })}
              />
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Section"
                value={data.section}
                onChange={(e) => setData({ ...data, section: e.target.value })}
              />
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Batch"
                value={data.batch}
                onChange={(e) => setData({ ...data, batch: e.target.value })}
              />
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Month"
                value={data.month}
                onChange={(e) => setData({ ...data, month: e.target.value })}
              />
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Screenshot URL"
                value={data.screenshot}
                onChange={(e) =>
                  setData({ ...data, screenshot: e.target.value })
                }
              />
            </>
          )}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Payment"
        message={`Are you sure you want to delete the payment for "${paymentToDelete?.fullName}"?`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
