// app/admin/AdminLayoutClient.tsx (Client Component)
"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";
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

  useEffect(() => {
    const token = getToken();
    if (!token && pathname !== "/admin/login") {
      toast.error("You must login first");
      router.push("/admin/login");
    } else if (token) {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen text-amber-400">
        Checking authentication...
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {isAuthenticated && <AdminSidebar />}
      <div className="flex-1 flex flex-col">
        {isAuthenticated && <AdminNavbar />}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
