"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import DataTable from "@/components/DataTable";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import toast from "react-hot-toast";

interface StaffMember {
  _id?: string;
  fullName: string;
  role: "admin" | "teacher";
  phoneNumber?: string;
  password?: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [formData, setFormData] = useState<StaffMember>({
    fullName: "",
    role: "teacher",
    phoneNumber: "",
    password: "",
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await api.get("/users/staff", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStaff(res.data.staff || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch staff list");
    }
  }, []);

  const handleCreateStaff = async () => {
    try {
      await api.post("/users", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchStaff();
      setFormData({ fullName: "", role: "teacher", phoneNumber: "", password: "" });
      toast.success("Staff member created successfully");
    } catch (err: unknown) {
      if (err instanceof Error && "response" in err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(apiErr.response?.data?.message || "Failed to create staff");
      } else {
        toast.error("Failed to create staff member");
      }
    }
  };

  const handleUpdateStaff = async () => {
    if (!staffToEdit?._id) return;
    try {
      await api.put(`/users/${staffToEdit._id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchStaff();
      setEditModalOpen(false);
      setStaffToEdit(null);
      setFormData({ fullName: "", role: "teacher", phoneNumber: "", password: "" });
      toast.success("Staff member updated successfully");
    } catch (err: unknown) {
      if (err instanceof Error && "response" in err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(apiErr.response?.data?.message || "Failed to update staff");
      } else {
        toast.error("Failed to update staff member");
      }
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete?._id) return;
    try {
      await api.delete(`/users/${staffToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Staff member deleted successfully");
      fetchStaff();
      setDeleteModalOpen(false);
      setStaffToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete staff member");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-amber-400 text-2xl font-bold">Staff & Instructors</h1>
      </div>

      <ModalForm title="Create New Staff Member" triggerText="Add Staff / Teacher" onSubmit={handleCreateStaff}>
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Full Name (e.g. Teacher Motuma Kidanu)"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
        <div>
          <label className="block text-xs text-amber-400 mb-1">Role</label>
          <select
            className="w-full p-2 rounded bg-gray-700 text-white"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "teacher" })}
          >
            <option value="teacher">Teacher / Instructor</option>
            <option value="admin">Admin & Instructor</option>
          </select>
        </div>
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="Phone Number (e.g. 0911223344)"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        />
        <input
          className="w-full p-2 rounded bg-gray-700 text-white"
          type="password"
          placeholder="Password (default: teacher123)"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </ModalForm>

      <DataTable
        columns={[
          { key: "fullName", label: "Full Name" },
          { key: "role", label: "Role" },
          { key: "phoneNumber", label: "Phone Number" },
          { key: "actions", label: "Actions" },
        ]}
        data={staff.map((s) => ({
          ...s,
          role: (
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                s.role === "admin"
                  ? "bg-purple-900/60 text-purple-300 border border-purple-800"
                  : "bg-blue-900/60 text-blue-300 border border-blue-800"
              }`}
            >
              {s.role === "admin" ? "Admin & Instructor" : "Teacher / Instructor"}
            </span>
          ),
          phoneNumber: s.phoneNumber || "N/A",
          actions: (
            <div className="flex gap-2" key={s._id}>
              <button
                className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                onClick={() => {
                  setStaffToEdit(s);
                  setFormData({ ...s, password: "" });
                  setEditModalOpen(true);
                }}
              >
                Edit
              </button>
              <button
                className="text-red-500 hover:text-red-700 text-sm font-semibold"
                onClick={() => {
                  setStaffToDelete(s);
                  setDeleteModalOpen(true);
                }}
              >
                Delete
              </button>
            </div>
          ),
        }))}
      />

      {staffToEdit && (
        <EditModal
          isOpen={editModalOpen}
          data={staffToEdit}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleUpdateStaff}
          renderFields={(
            data: StaffMember,
            setData: React.Dispatch<React.SetStateAction<StaffMember>>
          ) => (
            <>
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Full Name"
                value={data.fullName}
                onChange={(e) => setData({ ...data, fullName: e.target.value })}
              />
              <div>
                <label className="block text-xs text-amber-400 mb-1">Role</label>
                <select
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  value={data.role}
                  onChange={(e) => setData({ ...data, role: e.target.value as "admin" | "teacher" })}
                >
                  <option value="teacher">Teacher / Instructor</option>
                  <option value="admin">Admin & Instructor</option>
                </select>
              </div>
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                placeholder="Phone Number"
                value={data.phoneNumber || ""}
                onChange={(e) => setData({ ...data, phoneNumber: e.target.value })}
              />
              <input
                className="w-full p-2 rounded bg-gray-700 text-white"
                type="password"
                placeholder="New Password (leave empty to keep current)"
                value={data.password || ""}
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
            </>
          )}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Staff Member"
        message={`Are you sure you want to delete staff member "${staffToDelete?.fullName}"?`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteStaff}
      />
    </div>
  );
}
