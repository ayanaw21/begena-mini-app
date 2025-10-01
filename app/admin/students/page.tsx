"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { Student } from "@/types";
import DataTable from "@/components/DataTable";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import toast from "react-hot-toast";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState<Student>({
    fullName: "",
    begenaId: "",
    batch: "",
    section: "",
    department: "",
    phoneNumber: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterSection, setFilterSection] = useState("");

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStudents(res.data.students);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    }
  };

  const handleCreateStudent = async () => {
    try {
      await api.post("/students", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchStudents();
      setFormData({
        fullName: "",
        begenaId: "",
        batch: "",
        section: "",
        department: "",
        phoneNumber: "",
      });
      toast.success("Student created successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create student");
    }
  };

  const handleUpdateStudent = async () => {
    if (!studentToEdit?._id || !formData) return;

    try {
      await api.put(
        `/students/${studentToEdit._id}`,
        {
          fullName: formData.fullName,
          begenaId: formData.begenaId,
          batch: formData.batch,
          section: formData.section,
          department: formData.department,
          phoneNumber: formData.phoneNumber,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      fetchStudents();
      setEditModalOpen(false);
      setStudentToEdit(null);
      setFormData({
        fullName: "",
        begenaId: "",
        batch: "",
        section: "",
        department: "",
        phoneNumber: "",
      });
      toast.success("Student updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update student");
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete?._id) return;
    try {
      await api.delete(`/students/${studentToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Student deleted successfully");
      fetchStudents();
      setDeleteModalOpen(false);
      setStudentToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete student");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const uniqueBatches = Array.from(new Set(students.map((s) => s.batch)));
  const uniqueSections = Array.from(new Set(students.map((s) => s.section)));

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.begenaId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phoneNumber.includes(searchQuery);

      const matchesBatch = filterBatch ? s.batch === filterBatch : true;
      const matchesSection = filterSection ? s.section === filterSection : true;

      return matchesSearch && matchesBatch && matchesSection;
    });
  }, [students, searchQuery, filterBatch, filterSection]);

  return (
    <div>
      <h1 className="text-amber-400 text-2xl font-bold mb-4">Students</h1>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name, ID or phone"
          className="p-2 rounded bg-gray-700 text-white flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
        >
          <option value="">All Sections</option>
          {uniqueSections.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
      </div>

      {/* Add Student Modal */}
      <ModalForm title="Add Student" onSubmit={handleCreateStudent}>
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
        />
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Begena ID"
          value={formData.begenaId}
          onChange={(e) =>
            setFormData({ ...formData, begenaId: e.target.value })
          }
        />
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Batch"
          value={formData.batch}
          onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
        />
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Section"
          value={formData.section}
          onChange={(e) =>
            setFormData({ ...formData, section: e.target.value })
          }
        />
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Department"
          value={formData.department}
          onChange={(e) =>
            setFormData({ ...formData, department: e.target.value })
          }
        />
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
        />
      </ModalForm>

      {/* Data Table */}
      <DataTable
        columns={[
          { key: "fullName", label: "Full Name" },
          { key: "begenaId", label: "Begena ID" },
          { key: "batch", label: "Batch" },
          { key: "section", label: "Section" },
          { key: "department", label: "Department" },
          { key: "phoneNumber", label: "Phone" },
          { key: "actions", label: "Actions" },
        ]}
        data={filteredStudents.map((s) => ({
          ...s,
          actions: (
            <div className="flex gap-2">
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => {
                  setStudentToEdit(s);
                  setFormData({ ...s });
                  setEditModalOpen(true);
                }}
              >
                Edit
              </button>

              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  setStudentToDelete(s);
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
      {studentToEdit && (
        <EditModal
          isOpen={editModalOpen}
          data={studentToEdit}
          formData={studentToEdit}
          setFormData={setStudentToEdit as any}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleUpdateStudent}
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
                placeholder="Batch"
                value={data.batch}
                onChange={(e) => setData({ ...data, batch: e.target.value })}
              />
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Section"
                value={data.section}
                onChange={(e) => setData({ ...data, section: e.target.value })}
              />
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Department"
                value={data.department}
                onChange={(e) =>
                  setData({ ...data, department: e.target.value })
                }
              />
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Phone Number"
                value={data.phoneNumber}
                onChange={(e) =>
                  setData({ ...data, phoneNumber: e.target.value })
                }
              />
            </>
          )}
        />
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Student"
        message={`Are you sure you want to delete "${studentToDelete?.fullName}"?`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteStudent}
      />
    </div>
  );
}
