// AdminNavbar.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AdminNavbar() {
  const router = useRouter();
  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <nav className="h-16 bg-gray-800 flex justify-between items-center px-4 sm:px-6 border-b border-gray-700 lg:pl-4">
      {" "}
      {/* Added lg:pl-4 */}
      {/* Added left spacing for mobile to avoid hamburger menu overlap */}
      <h1 className="text-amber-400 text-xl sm:text-2xl font-bold truncate ml-12 lg:ml-0">
        {" "}
        {/* Added ml-12 for mobile */}
        Admin Panel
      </h1>
      <Button
        className="bg-amber-600 hover:bg-amber-700 text-sm sm:text-base"
        onClick={logout}
        size="sm"
      >
        Logout
      </Button>
    </nav>
  );
}
