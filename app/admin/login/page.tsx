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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!fullName || !password) {
      toast.error("Please enter both Full Name and Password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/admin/login", { fullName, password });
      setToken(res.data.token);
      router.push("/admin");
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <Card className="bg-gray-800 p-6 w-full max-w-sm sm:max-w-md rounded-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-amber-400 text-center text-xl sm:text-2xl">
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <input
            className="p-3 rounded bg-gray-700 text-white text-sm sm:text-base w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
          />
          <input
            className="p-3 rounded bg-gray-700 text-white text-sm sm:text-base w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <Button
            className="bg-amber-600 hover:bg-amber-700 w-full py-3"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <button
            className="mt-2 text-sm text-gray-400 hover:underline"
            onClick={() => router.push("/")}
          >
            Back to Home
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
