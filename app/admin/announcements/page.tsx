"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import DataTable from "@/components/DataTable";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface Announcement {
  _id?: string;
  title: string;
  body: string;
  date: string;
  time: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [formData, setFormData] = useState<Announcement>({
    title: "",
    body: "",
    date: "",
    time: "",
  });

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] =
    useState<Announcement | null>(null);
  const [announcementToEdit, setAnnouncementToEdit] =
    useState<Announcement | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/announcements", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAnnouncements(res.data.announcements);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to fetch announcements");
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      await api.post("/announcements", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchAnnouncements();
      setFormData({ title: "", body: "", date: "", time: "" });
      toast.success("Announcement created successfully");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to create announcement"
      );
    }
  };

  const handleUpdateAnnouncement = async () => {
    if (!announcementToEdit?._id) return;
    try {
      await api.put(
        `/announcements/${announcementToEdit._id}`,
        {
          title: announcementToEdit.title,
          body: announcementToEdit.body,
          date: announcementToEdit.date,
          time: announcementToEdit.time,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchAnnouncements();
      setEditModalOpen(false);
      setAnnouncementToEdit(null);
      toast.success("Announcement updated successfully");
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to update announcement"
      );
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!announcementToDelete?._id) return;
    try {
      await api.delete(`/announcements/${announcementToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Announcement deleted successfully");
      fetchAnnouncements();
      setDeleteModalOpen(false);
      setAnnouncementToDelete(null);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to delete announcement");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.body.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = filterDate ? a.date === filterDate : true;
      return matchesSearch && matchesDate;
    });
  }, [announcements, searchQuery, filterDate]);

  const uniqueDates = Array.from(new Set(announcements.map((a) => a.date)));

  return (
    <div>
      <h1 className="text-amber-400 text-2xl font-bold mb-4">Announcements</h1>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by title or body"
          className="p-2 rounded bg-gray-700 text-white flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        >
          <option value="">All Dates</option>
          {uniqueDates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      {/* Add Announcement Modal */}
      <ModalForm title="Add Announcement" onSubmit={handleCreateAnnouncement}>
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <textarea
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Body"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
        />
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Date (e.g., 2025-10-01)"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Time (e.g., 14:30)"
          value={formData.time}
          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
        />
      </ModalForm>

      {/* Data Table */}
      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "body", label: "Body" },
          { key: "date", label: "Date" },
          { key: "time", label: "Time" },
          { key: "actions", label: "Actions" },
        ]}
        data={filteredAnnouncements.map((a) => ({
          ...a,
          actions: (
            <div className="flex gap-2">
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => {
                  setAnnouncementToEdit(a);
                  setEditModalOpen(true);
                }}
              >
                Edit
              </button>

              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  setAnnouncementToDelete(a);
                  setDeleteModalOpen(true);
                }}
              >
                Delete
              </button>
            </div>
          ),
        }))}
      />

      {announcementToEdit && (
        <EditModal<Announcement>
          isOpen={editModalOpen}
          data={announcementToEdit}
          formData={announcementToEdit}
          setFormData={(update: Announcement) =>
            setAnnouncementToEdit((prev) => ({
              ...prev!,
              ...update,
            }))
          }
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleUpdateAnnouncement}
          renderFields={(data, setData) => (
            <>
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Title"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
              />
              <textarea
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Body"
                value={data.body}
                onChange={(e) =>
                  setData({ ...data, body: e.target.value || "" })
                }
              />
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Date (e.g., 2025-10-01)"
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value })}
              />
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Time (e.g., 14:30)"
                value={data.time}
                onChange={(e) => setData({ ...data, time: e.target.value })}
              />
            </>
          )}
        />
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Announcement"
        message={`Are you sure you want to delete the announcement "${announcementToDelete?.title}"?`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAnnouncement}
      />
    </div>
  );
}
