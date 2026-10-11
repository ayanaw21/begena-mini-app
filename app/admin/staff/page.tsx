"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import DataTable from "@/components/DataTable";
import ModalForm from "@/components/ModalForm";
import ConfirmModal from "@/components/ConfirmModal";
import EditModal from "@/components/EditModal";
import RowActions from "@/components/RowActions";
import { Badge } from "@/components/ui/badge";
import { Field, PageHeader } from "@/components/ui/page";
import CustomSelect from "@/components/ui/custom-select";
import Figure from "@/components/ui/figure";
import { siteImages } from "@/lib/images";
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
    <div className="space-y-6">
      <Figure
        src={siteImages.blessingBegena}
        alt="Staff"
        ratio="ultrawide"
        className="min-h-[140px] sm:min-h-[180px]"
        priority
        scrim
      >
        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
          አስተዳዳሪ ፖርታል · Admin Portal
        </p>
        <h1 className="mt-1.5 text-2xl font-bold sm:text-3xl text-foreground">
          አስተማሪዎች እና አባላት (Staff & Instructors)
        </h1>
      </Figure>

      <PageHeader
        title="Staff & Instructors"
        description="Admins and teachers who can sign in to the panel."
        action={
          <ModalForm
            title="Create New Staff Member"
            triggerText="Add Staff"
            onSubmit={handleCreateStaff}
          >
            <Field label="Full Name" htmlFor="staffName" required>
              <input
                id="staffName"
                placeholder="Motuma Kidanu"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </Field>
            <Field label="Role" htmlFor="staffRole" required>
              <CustomSelect
                id="staffRole"
                value={formData.role}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    role: val as "admin" | "teacher",
                  })
                }
                options={[
                  { value: "teacher", label: "Teacher / Instructor" },
                  { value: "admin", label: "Admin & Instructor" },
                ]}
              />
            </Field>
            <Field label="Phone Number" htmlFor="staffPhone">
              <input
                id="staffPhone"
                inputMode="tel"
                placeholder="0911223344"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
            </Field>
            <Field
              label="Password"
              htmlFor="staffPassword"
              hint="Leave empty to use the default password."
            >
              <input
                id="staffPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Set an initial password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </Field>
          </ModalForm>
        }
      />

      <DataTable
        columns={[
          { key: "fullName", label: "Full Name" },
          { key: "role", label: "Role" },
          { key: "phoneNumber", label: "Phone Number" },
          { key: "actions", label: "" },
        ]}
        data={staff.map((s) => ({
          ...s,
          role: (
            <Badge tone={s.role === "admin" ? "primary" : "info"}>
              {s.role === "admin" ? "Admin & Instructor" : "Teacher"}
            </Badge>
          ),
          phoneNumber: s.phoneNumber || "—",
          actions: (
            <RowActions
              key={s._id}
              onEdit={() => {
                setStaffToEdit(s);
                setFormData({ ...s, password: "" });
                setEditModalOpen(true);
              }}
              onDelete={() => {
                setStaffToDelete(s);
                setDeleteModalOpen(true);
              }}
            />
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
              <Field label="Full Name" htmlFor="editStaffName">
                <input
                  id="editStaffName"
                  value={data.fullName}
                  onChange={(e) =>
                    setData({ ...data, fullName: e.target.value })
                  }
                />
              </Field>
              <Field label="Role" htmlFor="editStaffRole">
                <CustomSelect
                  id="editStaffRole"
                  value={data.role}
                  onChange={(val) =>
                    setData({
                      ...data,
                      role: val as "admin" | "teacher",
                    })
                  }
                  options={[
                    { value: "teacher", label: "Teacher / Instructor" },
                    { value: "admin", label: "Admin & Instructor" },
                  ]}
                />
              </Field>
              <Field label="Phone Number" htmlFor="editStaffPhone">
                <input
                  id="editStaffPhone"
                  inputMode="tel"
                  value={data.phoneNumber || ""}
                  onChange={(e) =>
                    setData({ ...data, phoneNumber: e.target.value })
                  }
                />
              </Field>
              <Field
                label="New Password"
                htmlFor="editStaffPassword"
                hint="Leave empty to keep the current password."
              >
                <input
                  id="editStaffPassword"
                  type="password"
                  autoComplete="new-password"
                  value={data.password || ""}
                  onChange={(e) =>
                    setData({ ...data, password: e.target.value })
                  }
                />
              </Field>
            </>
          )}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Staff Member"
        message={`Are you sure you want to delete "${staffToDelete?.fullName}"? This cannot be undone.`}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteStaff}
      />
    </div>
  );
}
