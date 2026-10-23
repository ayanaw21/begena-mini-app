export interface AuthUser {
  id?: string;
  fullName?: string;
  role?: "admin" | "teacher" | string;
  department?: string;
  specialization?: string;
}

export const setToken = (token: string, user?: AuthUser) => {
  localStorage.setItem("token", token);
  if (user) {
    if (user.role) localStorage.setItem("userRole", user.role);
    if (user.fullName) localStorage.setItem("userName", user.fullName);
  } else {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role) localStorage.setItem("userRole", payload.role);
      if (payload.fullName) localStorage.setItem("userName", payload.fullName);
    } catch {}
  }
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const removeToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userName");
};

export const getUserRole = (): string | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("userRole");
  if (stored) return stored;

  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
};

export const getUserName = (): string | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("userName");
  if (stored) return stored;

  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.fullName || null;
  } catch {
    return null;
  }
};

export const isAdmin = (): boolean => {
  return getUserRole() === "admin";
};

export const isTeacher = (): boolean => {
  return getUserRole() === "teacher";
};

/** Reads the `exp` claim so an expired token is treated as logged out up front. */
export const isTokenExpired = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload?.exp) return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

export const getValidToken = () => {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    removeToken();
    return null;
  }
  return token;
};
