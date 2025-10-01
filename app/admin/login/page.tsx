"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { setToken } from "@/lib/auth";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/admin/login", { fullName, password });
      setToken(res.data.token);
      router.push("/admin");
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <Card className="bg-gray-800 p-6 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-amber-400 text-center">
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <input
            className="p-2 rounded bg-gray-700 text-white"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            className="p-2 rounded bg-gray-700 text-white"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            className="bg-amber-600 hover:bg-amber-700"
            onClick={handleLogin}
          >
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
