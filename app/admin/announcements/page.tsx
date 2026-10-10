"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import DataTable from "@/components/DataTable";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import RowActions from "@/components/RowActions";
import { Field, PageHeader } from "@/components/ui/page";
import CustomSelect from "@/components/ui/custom-select";
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
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Notices broadcast to students on the public home page."
        action={
          <ModalForm
            title="Add Announcement"
            onSubmit={handleCreateAnnouncement}
          >
            <Field label="Title" htmlFor="announcementTitle" required>
              <input
                id="announcementTitle"
                placeholder="Announcement title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </Field>
            <Field label="Body" htmlFor="announcementBody" required>
              <textarea
                id="announcementBody"
                rows={4}
                placeholder="Message shown to students"
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date" htmlFor="announcementDate">
                <input
                  id="announcementDate"
                  placeholder="2025-10-01"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </Field>
              <Field label="Time" htmlFor="announcementTime">
                <input
                  id="announcementTime"
                  placeholder="14:30"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </Field>
            </div>
          </ModalForm>
        }
      />

      {/* Search & filter */}
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by title or body"
          className="min-w-60 flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <CustomSelect
          className="w-auto min-w-[150px]"
          value={filterDate}
          onChange={(val) => setFilterDate(val)}
          options={[
            { value: "", label: "All dates" },
            ...uniqueDates.map((date) => ({
              value: date,
              label: date,
            })),
          ]}
        />
      </div>

      <DataTable
        columns={[
          { key: "title", label: "Title" },
          { key: "body", label: "Body" },
          { key: "date", label: "Date" },
          { key: "time", label: "Time" },
          { key: "actions", label: "" },
        ]}
        data={filteredAnnouncements.map((a) => ({
          ...a,
          body: (
            <span className="text-muted-foreground block max-w-xs truncate">
              {a.body}
            </span>
          ),
          actions: (
            <RowActions
              key={a._id}
              onEdit={() => {
                setAnnouncementToEdit(a);
                setEditModalOpen(true);
              }}
              onDelete={() => {
                setAnnouncementToDelete(a);
                setDeleteModalOpen(true);
              }}
            />
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
              <Field label="Title" htmlFor="editAnnouncementTitle">
                <input
                  id="editAnnouncementTitle"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                />
              </Field>
              <Field label="Body" htmlFor="editAnnouncementBody">
                <textarea
                  id="editAnnouncementBody"
                  rows={4}
                  value={data.body}
                  onChange={(e) =>
                    setData({ ...data, body: e.target.value || "" })
                  }
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date" htmlFor="editAnnouncementDate">
                  <input
                    id="editAnnouncementDate"
                    value={data.date}
                    onChange={(e) => setData({ ...data, date: e.target.value })}
                  />
                </Field>
                <Field label="Time" htmlFor="editAnnouncementTime">
                  <input
                    id="editAnnouncementTime"
                    value={data.time}
                    onChange={(e) => setData({ ...data, time: e.target.value })}
                  />
                </Field>
              </div>
            </>
          )}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${announcementToDelete?.title}"? This cannot be undone.`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAnnouncement}
      />
    </div>
  );
}
