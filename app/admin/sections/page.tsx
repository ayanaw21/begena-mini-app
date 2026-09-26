"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import api from "@/lib/api";
import { Section, Program, Admin } from "@/types";
import DataTable from "@/components/DataTable";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import toast from "react-hot-toast";

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [staffList, setStaffList] = useState<Admin[]>([]);

  const [formData, setFormData] = useState<Section>({
    section: "",
    program: "Begena",
    mainTeacherName: "",
    assistantTeacherName: "",
    capacity: 30,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterProgram, setFilterProgram] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null);

  const fetchSections = useCallback(async () => {
    try {
      const res = await api.get("/sections");
      setSections(res.data.sections || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch sections");
    }
  }, []);

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await api.get("/programs");
      setPrograms(res.data.programs || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/users/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaffList(res.data.staff || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleCreateSection = async () => {
    try {
      const payload = {
        ...formData,
        assignedTeacher: formData.mainTeacherName
          ? `${formData.mainTeacherName}${formData.assistantTeacherName ? ` & ${formData.assistantTeacherName}` : ""}`
          : "TBA",
      };

      await api.post("/sections", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchSections();
      setFormData({
        section: "",
        program: "Begena",
        mainTeacherName: "",
        assistantTeacherName: "",
        capacity: 30,
      });
      toast.success("Section created successfully");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create section");
    }
  };

  const handleUpdateSection = async () => {
    if (!sectionToEdit?._id) return;

    try {
      const payload = {
        ...formData,
        assignedTeacher: formData.mainTeacherName
          ? `${formData.mainTeacherName}${formData.assistantTeacherName ? ` & ${formData.assistantTeacherName}` : ""}`
          : "TBA",
      };

      await api.put(`/sections/${sectionToEdit._id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      fetchSections();
      setEditModalOpen(false);
      setSectionToEdit(null);
      toast.success("Section updated successfully");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update section");
    }
  };

  const handleDeleteSection = async () => {
    if (!sectionToDelete?._id) return;
    try {
      await api.delete(`/sections/${sectionToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Section deleted successfully");
      fetchSections();
      setDeleteModalOpen(false);
      setSectionToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete section");
    }
  };

  useEffect(() => {
    fetchSections();
    fetchPrograms();
    fetchStaff();
  }, [fetchSections, fetchPrograms, fetchStaff]);

  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      const matchesSearch = s.section
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesProgram = filterProgram ? s.program === filterProgram : true;

      return matchesSearch && matchesProgram;
    });
  }, [sections, searchQuery, filterProgram]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-amber-400 text-2xl font-bold">Sections & Teachers</h1>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by section name"
          className="p-2 rounded bg-gray-700 text-white flex-1 min-w-[200px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
        >
          <option value="">All Programs</option>
          {programs.map((prog) => (
            <option key={prog._id} value={prog.name}>
              {prog.name}
            </option>
          ))}
        </select>
      </div>

      <ModalForm title="Create New Section" triggerText="Add Section" onSubmit={handleCreateSection}>
        <div>
          <label className="block text-xs text-amber-400 mb-1">Select Program</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={formData.program}
            onChange={(e) => setFormData({ ...formData, program: e.target.value })}
          >
            {programs.map((prog) => (
              <option key={prog._id} value={prog.name}>
                {prog.name} ({prog.code})
              </option>
            ))}
          </select>
        </div>

        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Section Name (e.g. Basic A, Advanced B)"
          value={formData.section}
          onChange={(e) => setFormData({ ...formData, section: e.target.value })}
        />

        <div>
          <label className="block text-xs text-amber-400 mb-1">Main Teacher (ዋና መምህር)</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={formData.mainTeacherName}
            onChange={(e) => setFormData({ ...formData, mainTeacherName: e.target.value })}
          >
            <option value="">Select Main Teacher</option>
            {staffList.map((staff) => (
              <option key={staff.id || staff.fullName} value={staff.fullName}>
                {staff.fullName} ({staff.role})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-amber-400 mb-1">Assistant Teacher (ረዳት መምህር)</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={formData.assistantTeacherName}
            onChange={(e) => setFormData({ ...formData, assistantTeacherName: e.target.value })}
          >
            <option value="">Select Assistant Teacher (Optional)</option>
            {staffList.map((staff) => (
              <option key={staff.id || staff.fullName} value={staff.fullName}>
                {staff.fullName} ({staff.role})
              </option>
            ))}
          </select>
        </div>
      </ModalForm>

      <DataTable
        columns={[
          { key: "section", label: "Section" },
          { key: "program", label: "Program" },
          { key: "mainTeacherName", label: "Main Teacher" },
          { key: "assistantTeacherName", label: "Assistant Teacher" },
          { key: "actions", label: "Actions" },
        ]}
        data={filteredSections.map((s) => ({
          ...s,
          program: <span className="text-xs bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-900">{s.program || "Begena"}</span>,
          mainTeacherName: s.mainTeacherName || s.assignedTeacher || "TBA",
          assistantTeacherName: s.assistantTeacherName || "None",
          actions: (
            <div className="flex gap-2" key={s._id}>
              <button
                className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                onClick={() => {
                  setSectionToEdit(s);
                  setFormData({
                    section: s.section,
                    program: s.program || "Begena",
                    mainTeacherName: s.mainTeacherName || s.assignedTeacher || "",
                    assistantTeacherName: s.assistantTeacherName || "",
                    capacity: s.capacity || 30,
                  });
                  setEditModalOpen(true);
                }}
              >
                Edit
              </button>

              <button
                className="text-red-500 hover:text-red-700 text-sm font-semibold"
                onClick={() => {
                  setSectionToDelete(s);
                  setDeleteModalOpen(true);
                }}
              >
                Delete
              </button>
            </div>
          ),
        }))}
      />

      {sectionToEdit && (
        <EditModal
          isOpen={editModalOpen}
          data={sectionToEdit}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleUpdateSection}
          renderFields={(
            data: Section,
            setData: React.Dispatch<React.SetStateAction<Section>>
          ) => (
            <>
              <div>
                <label className="block text-xs text-amber-400 mb-1">Select Program</label>
                <select
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={data.program || "Begena"}
                  onChange={(e) => setData({ ...data, program: e.target.value })}
                >
                  {programs.map((prog) => (
                    <option key={prog._id} value={prog.name}>
                      {prog.name}
                    </option>
                  ))}
                </select>
              </div>

              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Section Name"
                value={data.section}
                onChange={(e) => setData({ ...data, section: e.target.value })}
              />

              <div>
                <label className="block text-xs text-amber-400 mb-1">Main Teacher</label>
                <select
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={data.mainTeacherName || ""}
                  onChange={(e) => setData({ ...data, mainTeacherName: e.target.value })}
                >
                  <option value="">Select Main Teacher</option>
                  {staffList.map((staff) => (
                    <option key={staff.id || staff.fullName} value={staff.fullName}>
                      {staff.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-amber-400 mb-1">Assistant Teacher</label>
                <select
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={data.assistantTeacherName || ""}
                  onChange={(e) => setData({ ...data, assistantTeacherName: e.target.value })}
                >
                  <option value="">Select Assistant Teacher</option>
                  {staffList.map((staff) => (
                    <option key={staff.id || staff.fullName} value={staff.fullName}>
                      {staff.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Section"
        message={`Are you sure you want to delete "${sectionToDelete?.section}"?`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteSection}
      />
    </div>
  );
}
