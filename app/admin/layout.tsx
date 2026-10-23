"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getValidToken, isTeacher } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = getValidToken();
    if (!token && pathname !== "/admin/login") {
      toast.error("Please log in to continue");
      router.push("/admin/login");
    } else if (token) {
      if (isTeacher() && pathname !== "/admin/login") {
        router.replace("/teacher/dashboard");
        return;
      }
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="text-muted-foreground flex min-h-screen items-center justify-center gap-3 text-sm">
        <Loader2 size={18} className="text-primary animate-spin" />
        Checking authentication...
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {isAuthenticated && (
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {isAuthenticated && (
          <AdminNavbar
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            isSidebarOpen={isSidebarOpen}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
