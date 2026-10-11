"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import DataCards from "@/components/DataCards";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import RowActions from "@/components/RowActions";
import { Badge } from "@/components/ui/badge";
import { Field, PageHeader } from "@/components/ui/page";
import Figure from "@/components/ui/figure";
import { siteImages } from "@/lib/images";
import toast from "react-hot-toast";

interface Program {
  _id?: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [formData, setFormData] = useState<Program>({
    name: "",
    code: "",
    description: "",
    isActive: true,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState<Program | null>(null);

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
      setFormData({ name: "", code: "", description: "", isActive: true });
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
      setFormData({ name: "", code: "", description: "", isActive: true });
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

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return (
    <div className="space-y-6">
      <Figure
        src={siteImages.mezmurHero}
        alt="Programs"
        ratio="ultrawide"
        className="min-h-[140px] sm:min-h-[180px]"
        priority
        scrim
      >
        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
          አስተዳዳሪ ፖርታል · Admin Portal
        </p>
        <h1 className="mt-1.5 text-2xl font-bold sm:text-3xl text-foreground">
          የስልጠና ፕሮግራሞች (Programs)
        </h1>
      </Figure>

      <PageHeader
        title="Programs"
        description="Instrument programs and the ID code prefix assigned to each."
        action={
          <ModalForm
            title="Create New Program"
            triggerText="Add Program"
            onSubmit={handleCreateProgram}
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
            <Field
              label="Program Code"
              htmlFor="programCode"
              hint="Used as the student ID prefix, e.g. BG-2026-001."
              required
            >
              <input
                id="programCode"
                className="font-mono uppercase"
                placeholder="BG, MS, KR"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
              />
            </Field>
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
            <Badge tone="primary" className="font-mono">
              {p.code}
            </Badge>
          ),
          fields: [
            {
              label: "Description",
              value: p.description || "—",
              wide: true,
            },
          ],
          actions: (
            <RowActions
              onEdit={() => {
                setProgramToEdit(p);
                setFormData({ ...p });
                setEditModalOpen(true);
              }}
              onDelete={() => {
                setProgramToDelete(p);
                setDeleteModalOpen(true);
              }}
            />
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
              <Field label="Program Code" htmlFor="editProgramCode">
                <input
                  id="editProgramCode"
                  className="font-mono uppercase"
                  value={data.code}
                  onChange={(e) => setData({ ...data, code: e.target.value })}
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
