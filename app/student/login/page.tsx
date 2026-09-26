"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";

export default function StudentLogin() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!studentId || !password) {
      toast.error("Please enter both Student ID and Password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/student/login", { studentId, password });
      if (res.data.token) {
        localStorage.setItem("studentToken", res.data.token);
        toast.success("Welcome to your Student Portal!");
        router.push("/student/dashboard");
      }
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error && "response" in err) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(apiErr.response?.data?.message || "Login failed. Check your ID and password.");
      } else {
        toast.error("Login failed. Check your Student ID and password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <Card className="bg-gray-800 p-6 w-full max-w-sm sm:max-w-md rounded-lg shadow-lg border border-amber-950">
        <CardHeader>
          <CardTitle className="text-amber-400 text-center text-xl sm:text-2xl font-bold">
            Student Portal Login
          </CardTitle>
          <p className="text-gray-400 text-center text-xs sm:text-sm mt-1">
            Access your multi-year payments, class schedules, and attendance log
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 mt-2">
          <div>
            <label className="block text-xs text-amber-400 font-semibold mb-1">Student ID (ተማሪ መለያ)</label>
            <input
              className="p-3 rounded bg-gray-700 text-white text-sm sm:text-base w-full focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
              placeholder="e.g. BG-2026-001 or MS-2026-001"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-xs text-amber-400 font-semibold mb-1">Password (የይለፍ ቃል)</label>
            <input
              className="p-3 rounded bg-gray-700 text-white text-sm sm:text-base w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              type="password"
              placeholder="Enter your password (default is your phone)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-gray-900 font-bold w-full py-3 mt-2"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login to Student Portal"}
          </Button>
          <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
            <button
              className="hover:underline hover:text-amber-400"
              onClick={() => router.push("/")}
            >
              ← Back to Home
            </button>
            <button
              className="hover:underline hover:text-amber-400"
              onClick={() => router.push("/payment")}
            >
              Submit Payment Proof →
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
