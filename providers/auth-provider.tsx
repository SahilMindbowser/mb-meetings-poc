"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface User {
  id: string;
  _json: {
    email: string;
    given_name: string;
    family_name: string;
    picture: string;
    hd: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      validateToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch("http://localhost:8080/auth/login/success", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.error) {
          setUser(data.user);
        } else {
          logout();
        }
      } else {
        logout();
      }
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string, userData: User) => {
    Cookies.set("token", token, { expires: 7 });
    localStorage.setItem("token", token);
    setUser(userData);
    router.push("/");
    router.refresh();
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:8080/auth/logout", {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    Cookies.remove("token");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
