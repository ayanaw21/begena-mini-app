"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import api from "@/lib/api";
import DataTable from "@/components/DataTable";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import toast from "react-hot-toast";
import { Payment, Student, Program, Section } from "@/types";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "matrix">("list");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Modals & Action States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const ethiopianMonths = useMemo(
    () => [
      { key: "October", label: "ጥቅምት" },
      { key: "November", label: "ሕዳር" },
      { key: "December", label: "ታሕሳስ" },
      { key: "January", label: "ጥር" },
      { key: "February", label: "የካቲት" },
      { key: "March", label: "መጋቢት" },
      { key: "April", label: "ሚያዚያ" },
      { key: "May", label: "ግንቦት" },
    ],
    []
  );

  const fetchMetadata = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [payRes, studRes, progRes, secRes] = await Promise.all([
        api.get("/payments", { headers }).catch(() => ({ data: { payments: [] } })),
        api.get("/students", { headers }).catch(() => ({ data: { students: [] } })),
        api.get("/programs").catch(() => ({ data: { programs: [] } })),
        api.get("/sections").catch(() => ({ data: { sections: [] } })),
      ]);

      setPayments(payRes.data.payments || []);
      setStudents(studRes.data.students || []);
      setPrograms(progRes.data.programs || []);
      setSections(secRes.data.sections || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch payment management data");
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Status statistics
  const stats = useMemo(() => {
    const total = payments.length;
    const pending = payments.filter((p) => !p.status || p.status === "Pending").length;
    const approved = payments.filter((p) => p.status === "Approved").length;
    const rejected = payments.filter((p) => p.status === "Rejected").length;
    return { total, pending, approved, rejected };
  }, [payments]);

  // Unique options for dropdowns
  const uniqueSections = useMemo(() => {
    const fromPayments = payments.map((p) => p.section).filter(Boolean);
    const fromSecList = sections.map((s) => s.section).filter(Boolean);
    return Array.from(new Set([...fromPayments, ...fromSecList]));
  }, [payments, sections]);

  const uniqueBatches = useMemo(() => {
    const fromPayments = payments.map((p) => p.batch).filter(Boolean);
    const fromStuds = students.map((s) => s.batch).filter(Boolean);
    return Array.from(new Set([...fromPayments, ...fromStuds]));
  }, [payments, students]);

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const idStr = p.studentId || p.begenaId || "";
      const matchesSearch =
        (p.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        idStr.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProgram = filterProgram ? p.program === filterProgram : true;
      const matchesSection = filterSection ? p.section === filterSection : true;
      const matchesBatch = filterBatch ? p.batch === filterBatch : true;
      const matchesMonth = filterMonth ? p.month === filterMonth : true;
      const matchesStatus = filterStatus
        ? filterStatus === "Pending"
          ? !p.status || p.status === "Pending"
          : p.status === filterStatus
        : true;

      return (
        matchesSearch &&
        matchesProgram &&
        matchesSection &&
        matchesBatch &&
        matchesMonth &&
        matchesStatus
      );
    });
  }, [
    payments,
    searchQuery,
    filterProgram,
    filterSection,
    filterBatch,
    filterMonth,
    filterStatus,
  ]);

  // Action: Update status (Approve / Reject)
  const handleUpdateStatus = async (paymentId: string, status: "Approved" | "Rejected") => {
    setIsUpdatingStatus(paymentId);
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/payments/${paymentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPayments((prev) =>
        prev.map((p) => (p._id === paymentId ? { ...p, status } : p))
      );

      toast.success(`Payment marked as ${status}`);
      if (selectedPayment?._id === paymentId) {
        setSelectedPayment((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Action: Delete Payment
  const handleDelete = async () => {
    if (!paymentToDelete?._id) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/payments/${paymentToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
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

  // Action: Edit Payment
  const handleEdit = async (updatedPayment: Payment) => {
    if (!paymentToEdit?._id) return;
    setIsEditing(true);
    try {
      const token = localStorage.getItem("token");
      await api.put(`/payments/${paymentToEdit._id}`, updatedPayment, {
        headers: { Authorization: `Bearer ${token}` },
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
    <div className="space-y-6">
      {/* Title & View Switcher */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-amber-400 text-3xl font-bold">Payments & Verification Center</h1>
          <p className="text-gray-400 text-sm mt-1">
            Review submitted student receipts, verify bank transfer proofs, and track monthly payment status
          </p>
        </div>

        <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${
              activeTab === "list"
                ? "bg-amber-600 text-gray-950"
                : "text-gray-300 hover:text-white"
            }`}
          >
            📋 Live Receipts List ({filteredPayments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${
              activeTab === "matrix"
                ? "bg-amber-600 text-gray-950"
                : "text-gray-300 hover:text-white"
            }`}
          >
            📊 Monthly Payment Matrix
          </button>
        </div>
      </div>

      {/* Analytics Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase font-semibold">Total Receipts</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>

        <div className="bg-amber-950/40 border border-amber-800/80 rounded-lg p-4">
          <p className="text-xs text-amber-400 uppercase font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            Pending Approval
          </p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pending}</p>
        </div>

        <div className="bg-green-950/40 border border-green-800/80 rounded-lg p-4">
          <p className="text-xs text-green-400 uppercase font-semibold">Approved</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{stats.approved}</p>
        </div>

        <div className="bg-red-950/40 border border-red-800/80 rounded-lg p-4">
          <p className="text-xs text-red-400 uppercase font-semibold">Rejected</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by Student Name or ID..."
          className="p-2.5 rounded bg-gray-700 text-white flex-1 min-w-[200px] border border-gray-600 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="p-2.5 rounded bg-gray-700 text-white border border-gray-600 text-sm"
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
        >
          <option value="">All Programs</option>
          {programs.map((p) => (
            <option key={p._id || p.code} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          className="p-2.5 rounded bg-gray-700 text-white border border-gray-600 text-sm"
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
          className="p-2.5 rounded bg-gray-700 text-white border border-gray-600 text-sm"
          value={filterBatch}
          onChange={(e) => setFilterBatch(e.target.value)}
        >
          <option value="">All Batches</option>
          {uniqueBatches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          className="p-2.5 rounded bg-gray-700 text-white border border-gray-600 text-sm"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="">All Months</option>
          {ethiopianMonths.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label} ({m.key})
            </option>
          ))}
        </select>

        <select
          className="p-2.5 rounded bg-gray-700 text-white border border-gray-600 text-sm font-semibold"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Pending">🟡 Pending Verification</option>
          <option value="Approved">🟢 Approved</option>
          <option value="Rejected">🔴 Rejected</option>
        </select>
      </div>

      {/* Tab 1: Live Receipts Table */}
      {activeTab === "list" && (
        <DataTable
          columns={[
            { key: "studentIdDisplay", label: "Student ID" },
            { key: "fullName", label: "Student Name" },
            { key: "programSection", label: "Program & Section" },
            { key: "monthBatch", label: "Month & Batch" },
            { key: "screenshot", label: "Receipt Proof" },
            { key: "statusDisplay", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          data={filteredPayments.map((p) => {
            const idVal = p.studentId || p.begenaId || "N/A";
            const currentStatus = p.status || "Pending";

            return {
              ...p,
              studentIdDisplay: (
                <span className="font-mono font-bold text-amber-400 bg-gray-800 px-2 py-1 rounded border border-gray-700 text-xs">
                  {idVal}
                </span>
              ),
              programSection: (
                <div className="space-y-1" key={p._id}>
                  <span className="inline-block bg-amber-950 text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded border border-amber-900">
                    {p.program || "በገና (Begena)"}
                  </span>
                  <p className="text-xs text-gray-300">{p.section}</p>
                </div>
              ),
              monthBatch: (
                <div key={`${p._id}-mb`}>
                  <p className="font-bold text-white text-sm">{p.month}</p>
                  <p className="text-xs text-gray-400">{p.batch}</p>
                </div>
              ),
              screenshot: (
                <div
                  key={`${p._id}-img`}
                  className="w-16 h-16 cursor-pointer group relative overflow-hidden rounded border border-gray-700 bg-gray-950 flex items-center justify-center"
                  onClick={() => {
                    setSelectedPayment(p);
                    setImageModalOpen(true);
                  }}
                >
                  {p.screenshot ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.screenshot}
                      alt="Receipt screenshot"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  <span className="text-[10px] text-gray-400 font-semibold text-center p-1">
                    Click to Zoom
                  </span>
                </div>
              ),
              statusDisplay: (
                <span
                  key={`${p._id}-st`}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                    currentStatus === "Approved"
                      ? "bg-green-950 text-green-300 border border-green-700"
                      : currentStatus === "Rejected"
                      ? "bg-red-950 text-red-300 border border-red-700"
                      : "bg-amber-950 text-amber-300 border border-amber-700 animate-pulse"
                  }`}
                >
                  {currentStatus === "Approved" ? "✓ Approved" : currentStatus === "Rejected" ? "✕ Rejected" : "⏳ Pending"}
                </span>
              ),
              actions: (
                <div className="flex items-center gap-2 flex-wrap" key={`${p._id}-act`}>
                  {currentStatus !== "Approved" && (
                    <button
                      type="button"
                      disabled={isUpdatingStatus === p._id}
                      onClick={() => handleUpdateStatus(p._id!, "Approved")}
                      className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded transition-colors"
                    >
                      Approve
                    </button>
                  )}

                  {currentStatus !== "Rejected" && (
                    <button
                      type="button"
                      disabled={isUpdatingStatus === p._id}
                      onClick={() => handleUpdateStatus(p._id!, "Rejected")}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition-colors"
                    >
                      Reject
                    </button>
                  )}

                  <button
                    type="button"
                    className="text-blue-400 hover:text-blue-300 text-xs font-semibold ml-1"
                    onClick={() => {
                      setPaymentToEdit(p);
                      setEditModalOpen(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="text-gray-400 hover:text-red-400 text-xs font-semibold"
                    onClick={() => {
                      setPaymentToDelete(p);
                      setDeleteModalOpen(true);
                    }}
                  >
                    Delete
                  </button>
                </div>
              ),
            };
          })}
        />
      )}

      {/* Tab 2: Monthly Student Payment Matrix */}
      {activeTab === "matrix" && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-x-auto p-4 space-y-4">
          <div className="flex justify-between items-center text-xs text-gray-400 pb-2 border-b border-gray-700">
            <p>
              Overview of all registered students and their payment statuses per month.
            </p>
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-green-500"></span> Approved (Paid)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Pending Review</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-900"></span> Unpaid</span>
            </div>
          </div>

          <table className="w-full text-left text-sm text-gray-200 border-collapse">
            <thead>
              <tr className="bg-gray-900 text-amber-400 border-b border-gray-700 text-xs">
                <th className="p-3">Student ID</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Program & Section</th>
                {ethiopianMonths.map((m) => (
                  <th className="p-3 text-center" key={m.key}>
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/60">
              {students.map((student) => {
                const sId = student.studentId || student.begenaId;
                const studentPayments = payments.filter(
                  (p) => (p.studentId || p.begenaId) === sId
                );

                return (
                  <tr key={student._id || sId} className="hover:bg-gray-750 transition-colors">
                    <td className="p-3 font-mono text-amber-400 font-bold text-xs">{sId}</td>
                    <td className="p-3 font-semibold text-white">{student.fullName}</td>
                    <td className="p-3 text-xs text-gray-300">
                      <span className="text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded mr-1">
                        {student.program || "Begena"}
                      </span>
                      {student.section}
                    </td>

                    {ethiopianMonths.map((m) => {
                      const pay = studentPayments.find(
                        (p) => p.month?.toLowerCase() === m.key.toLowerCase()
                      );

                      const st = pay ? pay.status || "Pending" : "Unpaid";

                      return (
                        <td className="p-2 text-center" key={m.key}>
                          {st === "Approved" ? (
                            <span className="inline-block bg-green-950 text-green-300 border border-green-700 text-[10px] px-2 py-0.5 rounded font-bold">
                              ✓ Paid
                            </span>
                          ) : st === "Pending" ? (
                            <span className="inline-block bg-amber-950 text-amber-300 border border-amber-700 text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">
                              ⏳ Pending
                            </span>
                          ) : st === "Rejected" ? (
                            <span className="inline-block bg-red-950 text-red-300 border border-red-700 text-[10px] px-2 py-0.5 rounded font-bold">
                              ✕ Rejected
                            </span>
                          ) : (
                            <span className="text-red-500/80 font-semibold text-xs">✕ Unpaid</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* High-Res Receipt Inspection Modal */}
      {imageModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <div>
                <h2 className="text-xl font-bold text-amber-400">Payment Proof Verification</h2>
                <p className="text-xs text-gray-400">
                  Inspect receipt slip details for {selectedPayment.fullName} ({selectedPayment.studentId || selectedPayment.begenaId})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="text-gray-400 hover:text-white text-xl font-bold px-2"
              >
                ×
              </button>
            </div>

            {/* Receipt Image */}
            <div className="bg-gray-950 rounded-lg overflow-hidden border border-gray-700 flex justify-center max-h-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPayment.screenshot}
                alt="Receipt Full View"
                className="max-h-80 object-contain w-full"
              />
            </div>

            {/* Student & Payment Summary Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm bg-gray-900 p-4 rounded-lg border border-gray-700">
              <div>
                <span className="text-xs text-gray-400 block">Student Name:</span>
                <span className="font-bold text-white">{selectedPayment.fullName}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Student ID:</span>
                <span className="font-mono font-bold text-amber-400">{selectedPayment.studentId || selectedPayment.begenaId}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Program & Section:</span>
                <span className="text-white">{selectedPayment.program} — {selectedPayment.section}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Month & Batch:</span>
                <span className="text-white">{selectedPayment.month} ({selectedPayment.batch})</span>
              </div>
            </div>

            {/* Quick Action Approval Buttons inside Modal */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isUpdatingStatus === selectedPayment._id}
                onClick={() => handleUpdateStatus(selectedPayment._id!, "Approved")}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg transition-colors"
              >
                Approve Payment (ማረጋገጫ አጽድቅ)
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus === selectedPayment._id}
                onClick={() => handleUpdateStatus(selectedPayment._id!, "Rejected")}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition-colors"
              >
                Reject Payment (ውድቅ አድርግ)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
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
              <div>
                <label className="block text-xs text-amber-400 mb-1">Full Name</label>
                <input
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-amber-400 mb-1">Student ID</label>
                <input
                  className="w-full p-2 rounded bg-gray-700 text-white font-mono"
                  value={data.studentId || data.begenaId}
                  onChange={(e) => setData({ ...data, studentId: e.target.value, begenaId: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-amber-400 mb-1">Program</label>
                <input
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={data.program || ""}
                  onChange={(e) => setData({ ...data, program: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-amber-400 mb-1">Section</label>
                <input
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={data.section}
                  onChange={(e) => setData({ ...data, section: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-amber-400 mb-1">Month</label>
                <input
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={data.month}
                  onChange={(e) => setData({ ...data, month: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-amber-400 mb-1">Verification Status</label>
                <select
                  className="w-full p-2 rounded bg-gray-700 text-white font-bold"
                  value={data.status || "Pending"}
                  onChange={(e) => setData({ ...data, status: e.target.value as "Pending" | "Approved" | "Rejected" })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </>
          )}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Payment Record"
        message={`Are you sure you want to delete the payment proof for "${paymentToDelete?.fullName}" (${paymentToDelete?.month})?`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
