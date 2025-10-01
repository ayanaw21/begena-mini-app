"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import DataTable from "@/components/DataTable";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import toast from "react-hot-toast";
import { Payment } from "@/type"; // Import from your type/index.ts

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  // Confirm modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPayments(res.data.payments);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch payments");
    }
  };

  const handleUpdatePayment = async () => {
    if (!paymentToEdit?._id) return;
    try {
      await api.put(`/payments/${paymentToEdit._id}`, paymentToEdit, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchPayments();
      setEditModalOpen(false);
      setPaymentToEdit(null);
      toast.success("Payment updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update payment");
    }
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete?._id) return;
    try {
      await api.delete(`/payments/${paymentToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Payment deleted successfully");
      fetchPayments();
      setDeleteModalOpen(false);
      setPaymentToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete payment");
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
        p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.begenaId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSection = filterSection ? p.section === filterSection : true;
      const matchesBatch = filterBatch ? p.batch === filterBatch : true;
      const matchesMonth = filterMonth ? p.month === filterMonth : true;

      return matchesSearch && matchesSection && matchesBatch && matchesMonth;
    });
  }, [payments, searchQuery, filterSection, filterBatch, filterMonth]);

  return (
    <div>
      <h1 className="text-amber-400 text-2xl font-bold mb-4">Payments</h1>

      {/* Search & Filter */}
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
          actions: (
            <div className="flex gap-2">
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => {
                  setPaymentToEdit(p);
                  setEditModalOpen(true);
                }}
              >
                Edit
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  setPaymentToDelete(p);
                  setDeleteModalOpen(true);
                }}
              >
                Delete
              </button>
            </div>
          ),
        }))}
      />

      {/* Edit Modal */}
      {paymentToEdit && (
        <EditModal
          isOpen={editModalOpen}
          data={paymentToEdit}
          formData={paymentToEdit}
          setFormData={setPaymentToEdit as any}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleUpdatePayment}
          renderFields={(data, setData) => (
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Payment"
        message={`Are you sure you want to delete the payment for "${paymentToDelete?.fullName}"?`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeletePayment}
      />
    </div>
  );
}
