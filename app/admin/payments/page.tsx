"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import api from "@/lib/api";
import DataTable from "@/components/DataTable";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import RowActions from "@/components/RowActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, PageHeader, Panel, PanelHeader } from "@/components/ui/page";
import CustomSelect from "@/components/ui/custom-select";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { Payment, Student, Program, Section } from "@/types";

const statusTone = (status?: string) =>
  status === "Approved"
    ? "success"
    : status === "Rejected"
      ? "danger"
      : "warning";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDeleting, setIsDeleting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const filteredMatrixStudents = useMemo(() => {
    return students.filter((s) => {
      const idStr = s.studentId || s.begenaId || "";
      const matchesSearch =
        (s.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        idStr.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProgram = filterProgram ? s.program === filterProgram : true;
      const matchesSection = filterSection ? s.section === filterSection : true;
      const matchesBatch = filterBatch ? s.batch === filterBatch : true;
      return matchesSearch && matchesProgram && matchesSection && matchesBatch;
    });
  }, [students, searchQuery, filterProgram, filterSection, filterBatch]);

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
      <PageHeader
        title="Payments & Verification"
        description="Review submitted receipts, verify bank transfer proofs and track monthly payment status."
        action={
          <div className="bg-surface inline-flex rounded-lg border border-white/5 p-1">
            {[
              {
                id: "list" as const,
                label: `📋 Receipts (${filteredPayments.length})`,
              },
              { id: "matrix" as const, label: "📊 Monthly Matrix" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total receipts",
            value: stats.total,
            className: "",
          },
          {
            label: "Pending approval",
            value: stats.pending,
            className: "text-amber-400",
          },
          {
            label: "Approved",
            value: stats.approved,
            className: "text-emerald-400",
          },
          {
            label: "Rejected",
            value: stats.rejected,
            className: "text-red-400",
          },
        ].map((stat) => (
          <Panel key={stat.label} className="bg-surface/85 backdrop-blur-md p-4 border border-white/10">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {stat.label}
            </p>
            <p className={cn("mt-1.5 text-2xl font-bold", stat.className)}>
              {stat.value}
            </p>
          </Panel>
        ))}
      </div>

      {/* Filters */}
      <div className="relative z-20 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by student name or ID..."
          className="min-w-60 flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <CustomSelect
          className="w-auto min-w-[160px]"
          value={filterProgram}
          onChange={(val) => setFilterProgram(val)}
          options={[
            { value: "", label: "All programs" },
            ...programs.map((p) => ({
              value: p.name,
              label: p.name,
            })),
          ]}
        />

        <CustomSelect
          className="w-auto min-w-[150px]"
          value={filterSection}
          onChange={(val) => setFilterSection(val)}
          options={[
            { value: "", label: "All sections" },
            ...uniqueSections.map((sec) => ({
              value: sec,
              label: sec,
            })),
          ]}
        />

        <CustomSelect
          className="w-auto min-w-[140px]"
          value={filterBatch}
          onChange={(val) => setFilterBatch(val)}
          options={[
            { value: "", label: "All batches" },
            ...uniqueBatches.map((b) => ({
              value: b,
              label: b,
            })),
          ]}
        />

        <CustomSelect
          className="w-auto min-w-[160px]"
          value={filterMonth}
          onChange={(val) => setFilterMonth(val)}
          options={[
            { value: "", label: "All months" },
            ...ethiopianMonths.map((m) => ({
              value: m.key,
              label: `${m.label} (${m.key})`,
            })),
          ]}
        />

        <CustomSelect
          className="w-auto min-w-[170px]"
          value={filterStatus}
          onChange={(val) => setFilterStatus(val)}
          options={[
            { value: "", label: "All statuses" },
            { value: "Pending", label: "Pending verification" },
            { value: "Approved", label: "Approved" },
            { value: "Rejected", label: "Rejected" },
          ]}
        />
      </div>

      {/* Tab 1: receipts */}
      {activeTab === "list" && (
        <DataTable
          columns={[
            { key: "studentIdDisplay", label: "Student ID" },
            { key: "fullName", label: "Student Name" },
            { key: "monthBatch", label: "Month & Batch" },
            { key: "screenshot", label: "Receipt" },
            { key: "statusDisplay", label: "Status" },
            { key: "actions", label: "" },
          ]}
          data={filteredPayments.map((p) => {
            const idVal = p.studentId || p.begenaId || "N/A";
            const currentStatus = p.status || "Pending";

            return {
              ...p,
              studentIdDisplay: (
                <span className="text-primary font-mono text-xs">{idVal}</span>
              ),
              monthBatch: (
                <div key={`${p._id}-mb`}>
                  <p className="text-sm font-medium">{p.month}</p>
                  <p className="text-muted-foreground text-xs">{p.batch}</p>
                </div>
              ),
              screenshot: (
                <button
                  type="button"
                  key={`${p._id}-img`}
                  title="Click to inspect receipt"
                  className="bg-surface-raised hover:border-primary/40 relative size-12 cursor-pointer overflow-hidden rounded-md border border-white/10 transition-colors"
                  onClick={() => {
                    setSelectedPayment(p);
                    setImageModalOpen(true);
                  }}
                >
                  {p.screenshot ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.screenshot}
                      alt=""
                      className="size-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="text-muted-foreground flex size-full items-center justify-center">
                      <ImageIcon size={14} />
                    </span>
                  )}
                </button>
              ),
              statusDisplay: (
                <Badge key={`${p._id}-st`} tone={statusTone(currentStatus)}>
                  {currentStatus}
                </Badge>
              ),
              actions: (
                <RowActions
                  key={`${p._id}-act`}
                  onEdit={() => {
                    setPaymentToEdit(p);
                    setEditModalOpen(true);
                  }}
                  onDelete={() => {
                    setPaymentToDelete(p);
                    setDeleteModalOpen(true);
                  }}
                >
                  {currentStatus !== "Approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUpdatingStatus === p._id}
                      onClick={() => handleUpdateStatus(p._id!, "Approved")}
                    >
                      Approve
                    </Button>
                  )}
                  {currentStatus !== "Rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUpdatingStatus === p._id}
                      onClick={() => handleUpdateStatus(p._id!, "Rejected")}
                    >
                      Reject
                    </Button>
                  )}
                </RowActions>
              ),
            };
          })}
        />
      )}

      {/* Tab 2: monthly matrix */}
      {activeTab === "matrix" && (
        <Panel>
          <PanelHeader
            title="Monthly payment matrix"
            description="All registered students and their payment status per month."
            action={
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {[
                  { label: "Paid", color: "bg-emerald-500" },
                  { label: "Pending", color: "bg-amber-500" },
                  { label: "Rejected", color: "bg-red-500" },
                  { label: "Unpaid", color: "bg-white/20" },
                ].map((legend) => (
                  <span key={legend.label} className="flex items-center gap-1.5">
                    <span
                      className={cn("size-2 rounded-full", legend.color)}
                      aria-hidden
                    />
                    {legend.label}
                  </span>
                ))}
              </div>
            }
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-white/5 text-xs tracking-wider uppercase">
                  <th className="px-4 py-2.5 font-medium">Student ID</th>
                  <th className="px-4 py-2.5 font-medium">Full Name</th>
                  {ethiopianMonths.map((m) => (
                    <th key={m.key} className="px-3 py-2.5 text-center font-medium">
                      {m.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMatrixStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2 + ethiopianMonths.length}
                      className="text-muted-foreground py-8 text-center text-sm"
                    >
                      No students match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredMatrixStudents.map((student) => {
                    const sId = student.studentId || student.begenaId;
                    const studentPayments = payments.filter(
                      (p) => (p.studentId || p.begenaId) === sId
                    );

                    return (
                      <tr
                        key={student._id || sId}
                        className="hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="text-primary px-4 py-3 font-mono text-xs">
                          {sId}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {student.fullName}
                        </td>

                        {ethiopianMonths.map((m) => {
                          const pay = studentPayments.find(
                            (p) => p.month?.toLowerCase() === m.key.toLowerCase()
                          );
                          const st = pay ? pay.status || "Pending" : "Unpaid";

                          return (
                            <td key={m.key} className="px-3 py-3 text-center">
                              {st === "Unpaid" ? (
                                <span className="text-muted-foreground text-xs">
                                  —
                                </span>
                              ) : (
                                <Badge tone={statusTone(st)}>
                                  {st === "Approved" ? "Paid" : st}
                                </Badge>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Receipt inspection */}
      <Modal
        isOpen={imageModalOpen && !!selectedPayment}
        onClose={() => setImageModalOpen(false)}
        title="Payment proof verification"
        description={
          selectedPayment
            ? `${selectedPayment.fullName} (${
                selectedPayment.studentId || selectedPayment.begenaId
              })`
            : undefined
        }
        className="max-w-2xl"
        footer={
          selectedPayment ? (
            <>
              <Button
                variant="outline"
                disabled={isUpdatingStatus === selectedPayment._id}
                onClick={() =>
                  handleUpdateStatus(selectedPayment._id!, "Rejected")
                }
              >
                Reject (ውድቅ አድርግ)
              </Button>
              <Button
                disabled={isUpdatingStatus === selectedPayment._id}
                onClick={() =>
                  handleUpdateStatus(selectedPayment._id!, "Approved")
                }
              >
                Approve (አጽድቅ)
              </Button>
            </>
          ) : null
        }
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="bg-background flex max-h-80 justify-center overflow-hidden rounded-lg border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPayment.screenshot}
                alt="Receipt"
                className="max-h-80 w-full object-contain"
              />
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                { label: "Student name", value: selectedPayment.fullName },
                {
                  label: "Student ID",
                  value:
                    selectedPayment.studentId || selectedPayment.begenaId,
                  mono: true,
                },
                {
                  label: "Program & section",
                  value: `${selectedPayment.program} — ${selectedPayment.section}`,
                },
                {
                  label: "Month & batch",
                  value: `${selectedPayment.month} (${selectedPayment.batch})`,
                },
              ].map((item) => (
                <div key={item.label} className="min-w-0">
                  <dt className="text-muted-foreground text-xs">
                    {item.label}
                  </dt>
                  <dd
                    className={cn(
                      "mt-0.5 truncate text-sm font-medium",
                      item.mono && "text-primary font-mono"
                    )}
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Modal>

      {/* Edit payment */}
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
              <Field label="Full Name" htmlFor="editPaymentName">
                <input
                  id="editPaymentName"
                  value={data.fullName}
                  onChange={(e) =>
                    setData({ ...data, fullName: e.target.value })
                  }
                />
              </Field>

              <Field label="Student ID" htmlFor="editPaymentStudentId">
                <input
                  id="editPaymentStudentId"
                  className="font-mono"
                  value={data.studentId || data.begenaId}
                  onChange={(e) =>
                    setData({
                      ...data,
                      studentId: e.target.value,
                      begenaId: e.target.value,
                    })
                  }
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Program" htmlFor="editPaymentProgram">
                  <input
                    id="editPaymentProgram"
                    value={data.program || ""}
                    onChange={(e) =>
                      setData({ ...data, program: e.target.value })
                    }
                  />
                </Field>

                <Field label="Section" htmlFor="editPaymentSection">
                  <input
                    id="editPaymentSection"
                    value={data.section}
                    onChange={(e) =>
                      setData({ ...data, section: e.target.value })
                    }
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Month" htmlFor="editPaymentMonth">
                  <input
                    id="editPaymentMonth"
                    value={data.month}
                    onChange={(e) => setData({ ...data, month: e.target.value })}
                  />
                </Field>

                <Field label="Verification Status" htmlFor="editPaymentStatus">
                  <CustomSelect
                    id="editPaymentStatus"
                    value={data.status || "Pending"}
                    onChange={(val) =>
                      setData({
                        ...data,
                        status: val as
                          | "Pending"
                          | "Approved"
                          | "Rejected",
                      })
                    }
                    options={[
                      { value: "Pending", label: "Pending" },
                      { value: "Approved", label: "Approved" },
                      { value: "Rejected", label: "Rejected" },
                    ]}
                  />
                </Field>
              </div>
            </>
          )}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Payment Record"
        message={`Are you sure you want to delete the payment proof for "${paymentToDelete?.fullName}" (${paymentToDelete?.month})? This cannot be undone.`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
