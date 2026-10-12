"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Program } from "@/types";
import DataCards from "@/components/DataCards";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import RowActions from "@/components/RowActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Field, PageHeader } from "@/components/ui/page";
import CustomSelect from "@/components/ui/custom-select";
import { siteImages } from "@/lib/images";
import toast from "react-hot-toast";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [formData, setFormData] = useState<Program>({
    name: "",
    code: "",
    description: "",
    currentBatch: "Batch 8",
    status: "Active",
    isActive: true,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState<Program | null>(null);

  const [endModalOpen, setEndModalOpen] = useState(false);
  const [programToEnd, setProgramToEnd] = useState<Program | null>(null);
  const [nextBatchModalOpen, setNextBatchModalOpen] = useState(false);
  const [programForNextBatch, setProgramForNextBatch] = useState<Program | null>(null);
  const [customNextBatch, setCustomNextBatch] = useState("");

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await api.get("/programs");
      setPrograms(res.data.programs || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch programs");
    }
  }, []);

  const handleCreateProgram = async () => {
    try {
      await api.post("/programs", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchPrograms();
      setFormData({
        name: "",
        code: "",
        description: "",
        currentBatch: "Batch 8",
        status: "Active",
        isActive: true,
      });
      toast.success("Program created successfully");
    } catch (err: unknown) {
      if (err instanceof Error && "response" in err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(apiErr.response?.data?.message || "Failed to create program");
      } else {
        toast.error("Failed to create program");
      }
    }
  };

  const handleUpdateProgram = async () => {
    if (!programToEdit?._id) return;
    try {
      await api.put(`/programs/${programToEdit._id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchPrograms();
      setEditModalOpen(false);
      setProgramToEdit(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        currentBatch: "Batch 8",
        status: "Active",
        isActive: true,
      });
      toast.success("Program updated successfully");
    } catch (err: unknown) {
      if (err instanceof Error && "response" in err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(apiErr.response?.data?.message || "Failed to update program");
      } else {
        toast.error("Failed to update program");
      }
    }
  };

  const handleDeleteProgram = async () => {
    if (!programToDelete?._id) return;
    try {
      await api.delete(`/programs/${programToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Program deleted successfully");
      fetchPrograms();
      setDeleteModalOpen(false);
      setProgramToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete program");
    }
  };

  const handleEndProgram = async () => {
    if (!programToEnd?._id) return;
    try {
      await api.put(
        `/programs/${programToEnd._id}/end`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success(
        `Program "${programToEnd.name}" (${programToEnd.currentBatch || "Batch"}) ended.`
      );
      fetchPrograms();
      setEndModalOpen(false);
      setProgramToEnd(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to end program cycle");
    }
  };

  const handleStartNextBatch = async () => {
    if (!programForNextBatch?._id) return;
    try {
      await api.put(
        `/programs/${programForNextBatch._id}/start-batch`,
        { nextBatch: customNextBatch },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success(
        `New batch started for "${programForNextBatch.name}"!`
      );
      fetchPrograms();
      setNextBatchModalOpen(false);
      setProgramForNextBatch(null);
      setCustomNextBatch("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to start next batch");
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="አስተዳዳሪ ፖርታል · Admin Portal"
        title="የስልጠና ፕሮግራሞች (Programs)"
        description="Instrument programs, active batch cycles, and ID code prefixes."
        action={
          <ModalForm
            title="Create New Program"
            triggerText="Add Program"
            onSubmit={handleCreateProgram}
            image={siteImages.adminCard1}
          >
            <Field label="Program Name" htmlFor="programName" required>
              <input
                id="programName"
                placeholder="በገና, መሰንቆ, ክራር"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Program Code"
                htmlFor="programCode"
                hint="Used as student ID prefix, e.g. BG, MS, KR."
                required
              >
                <input
                  id="programCode"
                  className="font-mono uppercase"
                  placeholder="BG, MS, KR"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                />
              </Field>

              <Field
                label="Initial Batch / ዙር"
                htmlFor="programBatch"
                hint="e.g. Batch 8"
                required
              >
                <input
                  id="programBatch"
                  placeholder="Batch 8"
                  value={formData.currentBatch}
                  onChange={(e) =>
                    setFormData({ ...formData, currentBatch: e.target.value })
                  }
                />
              </Field>
            </div>

            <Field label="Description" htmlFor="programDescription">
              <input
                id="programDescription"
                placeholder="Short description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Field>
          </ModalForm>
        }
      />

      <DataCards
        emptyTitle="No programs yet"
        emptyDescription="Add a program to start assigning student ID prefixes."
        items={programs.map((p) => ({
          id: p._id ?? p.code,
          title: p.name,
          badge: (
            <div className="flex items-center gap-1.5">
              <Badge tone="primary" className="font-mono">
                {p.code}
              </Badge>
              <Badge tone={p.status === "Ended" ? "danger" : "success"}>
                {p.status || "Active"}
              </Badge>
            </div>
          ),
          fields: [
            {
              label: "Current Batch",
              value: p.currentBatch || "Batch 1",
            },
            {
              label: "Status",
              value: p.status || "Active",
            },
            {
              label: "Description",
              value: p.description || "—",
              wide: true,
            },
          ],
          actions: (
            <div className="flex items-center gap-2">
              {p.status !== "Ended" ? (
                <button
                  type="button"
                  onClick={() => {
                    setProgramToEnd(p);
                    setEndModalOpen(true);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition cursor-pointer"
                >
                  🛑 End Batch
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setProgramForNextBatch(p);
                    const match = (p.currentBatch || "").match(/Batch\s*(\d+)/i);
                    const next = match
                      ? `Batch ${parseInt(match[1], 10) + 1}`
                      : "Batch 2";
                    setCustomNextBatch(next);
                    setNextBatchModalOpen(true);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
                >
                  🚀 Start Next Batch
                </button>
              )}

              <RowActions
                onEdit={() => {
                  setProgramToEdit(p);
                  setFormData({
                    ...p,
                    currentBatch: p.currentBatch || "Batch 8",
                    status: p.status || "Active",
                  });
                  setEditModalOpen(true);
                }}
                onDelete={() => {
                  setProgramToDelete(p);
                  setDeleteModalOpen(true);
                }}
              />
            </div>
          ),
        }))}
      />

      {programToEdit && (
        <EditModal
          isOpen={editModalOpen}
          data={programToEdit}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleUpdateProgram}
          renderFields={(
            data: Program,
            setData: React.Dispatch<React.SetStateAction<Program>>
          ) => (
            <>
              <Field label="Program Name" htmlFor="editProgramName">
                <input
                  id="editProgramName"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Program Code" htmlFor="editProgramCode">
                  <input
                    id="editProgramCode"
                    className="font-mono uppercase"
                    value={data.code}
                    onChange={(e) =>
                      setData({ ...data, code: e.target.value.toUpperCase() })
                    }
                  />
                </Field>

                <Field label="Current Batch / ዙር" htmlFor="editProgramBatch">
                  <input
                    id="editProgramBatch"
                    value={data.currentBatch || "Batch 8"}
                    onChange={(e) =>
                      setData({ ...data, currentBatch: e.target.value })
                    }
                  />
                </Field>
              </div>

              <Field label="Program Status" htmlFor="editProgramStatus">
                <CustomSelect
                  id="editProgramStatus"
                  value={data.status || "Active"}
                  onChange={(val) =>
                    setData({
                      ...data,
                      status: val as "Active" | "Ended",
                    })
                  }
                  options={[
                    { value: "Active", label: "Active (Ongoing)" },
                    { value: "Ended", label: "Ended / Completed" },
                  ]}
                />
              </Field>

              <Field label="Description" htmlFor="editProgramDescription">
                <input
                  id="editProgramDescription"
                  value={data.description}
                  onChange={(e) =>
                    setData({ ...data, description: e.target.value })
                  }
                />
              </Field>
            </>
          )}
        />
      )}

      {/* End Batch Confirmation Modal */}
      <ConfirmModal
        isOpen={endModalOpen}
        title="End Program Cycle / Batch"
        message={`Are you sure you want to end "${programToEnd?.name}" (${programToEnd?.currentBatch || "Batch"})? This marks the current batch as Ended.`}
        onCancel={() => setEndModalOpen(false)}
        onConfirm={handleEndProgram}
      />

      {/* Start Next Batch Modal */}
      {nextBatchModalOpen && (
        <Modal
          isOpen={nextBatchModalOpen}
          onClose={() => setNextBatchModalOpen(false)}
          title="🚀 Start Next Batch"
          description={`Start a new training cycle for "${programForNextBatch?.name}".`}
          footer={
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setNextBatchModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleStartNextBatch}
              >
                Start New Batch
              </Button>
            </div>
          }
        >
          <Field
            label="Next Batch Name"
            htmlFor="nextBatchInput"
            hint="Enter the new batch name or number."
            required
          >
            <input
              id="nextBatchInput"
              value={customNextBatch}
              onChange={(e) => setCustomNextBatch(e.target.value)}
              placeholder="e.g. Batch 9"
            />
          </Field>
        </Modal>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Program"
        message={`Are you sure you want to delete the program "${programToDelete?.name}"? This cannot be undone.`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteProgram}
      />
    </div>
  );
}
