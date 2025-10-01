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
    <nav className="h-16 bg-gray-800 flex justify-between items-center px-6 border-b border-gray-700">
      <h1 className="text-amber-400 text-2xl font-bold">Admin Panel</h1>
      <Button className="bg-amber-600 hover:bg-amber-700" onClick={logout}>
        Logout
      </Button>
    </nav>
  );
}
