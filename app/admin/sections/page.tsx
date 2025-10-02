"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { Section } from "@/types";
import DataTable from "@/components/DataTable";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import toast from "react-hot-toast";

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [formData, setFormData] = useState<Section>({
    section: "",
    assignedTeacher: "",
    classDate: "",
    classTime: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<Section | null>(null);

  const fetchSections = async () => {
    try {
      const res = await api.get("/sections", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSections(res.data.sections);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch sections");
    }
  };

  const handleCreateSection = async () => {
    try {
      await api.post("/sections", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchSections();
      setFormData({
        section: "",
        assignedTeacher: "",
        classDate: "",
        classTime: "",
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
      await api.put(
        `/sections/${sectionToEdit._id}`,
        {
          section: sectionToEdit.section,
          assignedTeacher: sectionToEdit.assignedTeacher,
          classDate: sectionToEdit.classDate,
          classTime: sectionToEdit.classTime,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

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
  }, []);

  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      const matchesSearch = s.section
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesSection = filterSection ? s.section === filterSection : true;
      const matchesTeacher = filterTeacher
        ? s.assignedTeacher === filterTeacher
        : true;

      return matchesSearch && matchesSection && matchesTeacher;
    });
  }, [sections, searchQuery, filterSection, filterTeacher]);

  return (
    <div>
      <h1 className="text-amber-400 text-2xl font-bold mb-4">Sections</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by section name"
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
          {[...new Set(sections.map((s) => s.section))].map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>

        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={filterTeacher}
          onChange={(e) => setFilterTeacher(e.target.value)}
        >
          <option value="">All Teachers</option>
          {[...new Set(sections.map((s) => s.assignedTeacher))].map(
            (teacher) => (
              <option key={teacher} value={teacher}>
                {teacher}
              </option>
            )
          )}
        </select>
      </div>

      <ModalForm title="Add Section" onSubmit={handleCreateSection}>
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
          placeholder="Assigned Teacher"
          value={formData.assignedTeacher}
          onChange={(e) =>
            setFormData({ ...formData, assignedTeacher: e.target.value })
          }
        />
        <select
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={formData.classDate}
          onChange={(e) =>
            setFormData({ ...formData, classDate: e.target.value })
          }
        >
          <option value="">Select Day</option>
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Class Time (e.g. 8:30 - 10:00)"
          value={formData.classTime}
          onChange={(e) =>
            setFormData({ ...formData, classTime: e.target.value })
          }
        />
      </ModalForm>

      <DataTable
        columns={[
          { key: "section", label: "Section" },
          { key: "assignedTeacher", label: "Assigned Teacher" },
          { key: "classDate", label: "Class Day" },
          { key: "classTime", label: "Class Time" },
          { key: "actions", label: "Actions" },
        ]}
        data={filteredSections.map((s) => ({
          ...s,
          actions: (
            <div className="flex gap-2">
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => {
                  setSectionToEdit(s);
                  setEditModalOpen(true);
                }}
              >
                Edit
              </button>

              <button
                className="text-red-500 hover:text-red-700"
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
          formData={sectionToEdit}
          setFormData={
            setSectionToEdit as React.Dispatch<
              React.SetStateAction<Section | null>
            >
          }
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleUpdateSection}
          renderFields={(
            data: Section,
            setData: React.Dispatch<React.SetStateAction<Section>>
          ) => (
            <>
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Section"
                value={data.section}
                onChange={(e) => setData({ ...data, section: e.target.value })}
              />
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Assigned Teacher"
                value={data.assignedTeacher}
                onChange={(e) =>
                  setData({ ...data, assignedTeacher: e.target.value })
                }
              />
              <select
                className="w-full p-2 rounded bg-gray-700 text-white"
                value={data.classDate}
                onChange={(e) =>
                  setData({ ...data, classDate: e.target.value })
                }
              >
                <option value="">Select Day</option>
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Class Time (e.g. 8:30 - 10:00)"
                value={data.classTime}
                onChange={(e) =>
                  setData({ ...data, classTime: e.target.value })
                }
              />
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
