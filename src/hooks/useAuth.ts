import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/providers/trpc";

interface AuthUser {
  id: number;
  name: string;
  role: "admin" | "fundi";
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const verifyQuery = trpc.worker.verifyToken.useQuery(
    { token: localStorage.getItem("pendo_token") || "" },
    { enabled: false, retry: false }
  );

  const loginMutation = trpc.worker.login.useMutation();

  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem("pendo_token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await verifyQuery.refetch();
      if (result.data) {
        setUser(result.data);
      } else {
        localStorage.removeItem("pendo_token");
      }
    } catch {
      localStorage.removeItem("pendo_token");
    } finally {
      setIsLoading(false);
    }
  }, [verifyQuery]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const login = async (name: string, pin: string) => {
    const result = await loginMutation.mutateAsync({ name, pin });
    if (result.token) {
      localStorage.setItem("pendo_token", result.token);
      setUser(result.worker);
    }
    return result;
  };

  const logout = () => {
    localStorage.removeItem("pendo_token");
    setUser(null);
    window.location.href = "/";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    logout,
  };
}
