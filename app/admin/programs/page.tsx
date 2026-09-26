"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import DataTable from "@/components/DataTable";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-amber-400 text-2xl font-bold">Programs Management</h1>
      </div>

      <ModalForm title="Create New Program" triggerText="Add Program" onSubmit={handleCreateProgram}>
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Program Name (e.g. በገና, መሰንቆ, ክራር)"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          className="w-full p-2 rounded bg-gray-700 text-white uppercase"
          placeholder="Program Code (e.g. BG, MS, KR)"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
        />
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </ModalForm>

      <DataTable
        columns={[
          { key: "name", label: "Program Name" },
          { key: "code", label: "Code Prefix" },
          { key: "description", label: "Description" },
          { key: "actions", label: "Actions" },
        ]}
        data={programs.map((p) => ({
          ...p,
          code: <span className="font-mono text-amber-400 font-bold bg-gray-800 px-2 py-0.5 rounded border border-amber-950">{p.code}</span>,
          actions: (
            <div className="flex gap-2" key={p._id}>
              <button
                className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                onClick={() => {
                  setProgramToEdit(p);
                  setFormData({ ...p });
                  setEditModalOpen(true);
                }}
              >
                Edit
              </button>
              <button
                className="text-red-500 hover:text-red-700 text-sm font-semibold"
                onClick={() => {
                  setProgramToDelete(p);
                  setDeleteModalOpen(true);
                }}
              >
                Delete
              </button>
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
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Program Name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
              <input
                className="w-full p-2 rounded bg-gray-700 text-white uppercase"
                placeholder="Program Code"
                value={data.code}
                onChange={(e) => setData({ ...data, code: e.target.value })}
              />
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Description"
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
              />
            </>
          )}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Program"
        message={`Are you sure you want to delete program "${programToDelete?.name}"?`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteProgram}
      />
    </div>
  );
}
