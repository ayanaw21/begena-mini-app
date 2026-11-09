"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, LogOut, Menu, X, KeyRound } from "lucide-react";
import { getUserName, removeToken } from "@/lib/auth";
import api from "@/lib/api";
import toast from "react-hot-toast";

import { adminMenu } from "./AdminSidebar";

interface AdminNavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function AdminNavbar({
  onToggleSidebar,
  isSidebarOpen,
}: AdminNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");

  // Self password change modal state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    setUserName(getUserName() || "Staff Member");
  }, []);

  const currentLabel =
    adminMenu
      .flatMap((group) => group.items)
      .find((item) => item.href === pathname)?.label ?? "Admin";

  const logout = () => {
    removeToken();
    router.push("/admin/login");
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      toast.error("አዲሱ የይለፍ ቃል ቢያንስ 4 ፊደላት/ቁጥሮች መሆን አለበት (At least 4 chars)");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("የይለፍ ቃሎቹ አይመሳሰሉም (Passwords do not match)");
      return;
    }

    try {
      setChangingPassword(true);
      const res = await api.put(
        "/auth/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(res.data.message || "የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordModalOpen(false);
    } catch (err: unknown) {
      console.error(err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || "የይለፍ ቃል መቀየር አልተቻለም");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <>
      <header className="bg-background/85 sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-white/5 px-4 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            onClick={onToggleSidebar}
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold sm:text-lg">
              {currentLabel}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userName && (
            <div className="hidden md:flex items-center mr-2">
              <span className="text-xs text-foreground font-medium">{userName}</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPasswordModalOpen(true)}
            className="text-xs border-white/10 hover:border-primary/40 flex items-center gap-1.5"
            title="የይለፍ ቃል መቀየሪያ"
          >
            <KeyRound size={13} className="text-amber-400" />
            <span className="hidden sm:inline">Password</span>
          </Button>

          <Button asChild variant="ghost" size="sm">
            <Link href="/" target="_blank">
              <ExternalLink size={14} />
              <span className="hidden sm:inline">View site</span>
            </Link>
          </Button>

          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPasswordModalOpen(false)}
        >
          <div
            className="relative max-w-md w-full bg-slate-900 rounded-2xl p-6 border border-white/15 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <KeyRound size={18} className="text-amber-400" />
                <h3 className="text-foreground">የይለፍ ቃል ማደሻ (Change Password)</h3>
              </div>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              የእርስዎን መለያ ({userName}) ደህንነት ለመጠበቅ የይለፍ ቃልዎን እዚህ ማደስ ይችላሉ።
            </p>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">
                  የአሁኑ የይለፍ ቃል (Current Password)
                </label>
                <input
                  type="password"
                  placeholder="የአሁኑን የይለፍ ቃል ያስገቡ"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">
                  አዲስ የይለፍ ቃል (New Password) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="ቢያንስ 4 ፊደላት ወይም ቁጥሮች"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">
                  አዲሱን የይለፍ ቃል ያረጋግጡ (Confirm New Password) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="አዲሱን የይለፍ ቃል ደግመው ያስገቡ"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPasswordModalOpen(false)}
                  disabled={changingPassword}
                >
                  ሰርዝ (Cancel)
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={changingPassword || !newPassword}
                  className="bg-primary text-primary-foreground font-semibold"
                >
                  {changingPassword ? "በመቀየር ላይ..." : "የይለፍ ቃል ቀይር"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
