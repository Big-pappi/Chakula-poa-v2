"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { auth, tokenManager } from "@/lib/api";
import type { User } from "@/lib/types";

// TODO: VERIFICATION SYSTEM INTEGRATION
// Add these methods to AuthContextType when implementing verification:
// - sendVerificationCode: (phone: string) => Promise<{ success: boolean; error?: string }>
// - verifyCode: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>
// - resendVerificationCode: (phone: string) => Promise<{ success: boolean; error?: string }>
// - isVerified: boolean (add to user state)
// 
// Backend API endpoints needed:
// - POST /api/users/send-verification/ - Send OTP to phone/email
// - POST /api/users/verify/ - Verify OTP code
// - POST /api/users/resend-verification/ - Resend OTP with rate limiting

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: {
    identifier: string; // Can be email or phone
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    first_name: string;
    last_name?: string;
    phone_number: string;
    email?: string;
    registration_number?: string;
    restaurant_id?: string;
    region?: string;
    password: string;
  }) => Promise<{ success: boolean; cps_number?: string; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await auth.me();
      if (response.data) {
        setUser(response.data);
        return true;
      } else {
        tokenManager.clearTokens();
        setUser(null);
        return false;
      }
    } catch {
      tokenManager.clearTokens();
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenManager.getAccessToken();
      if (token) {
        await fetchUser();
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [fetchUser]);

  const login = async (data: { identifier: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await auth.login({
        identifier: data.identifier,
        password: data.password,
      });

      if (response.data) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: response.error || "Login failed" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    first_name: string;
    last_name?: string;
    phone_number: string;
    email?: string;
    registration_number?: string;
    restaurant_id?: string;
    region?: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await auth.register(data);

      if (response.data) {
        setUser(response.data.user);
        return { success: true, cps_number: response.data.cps_number };
      }
      return { success: false, error: response.error || "Registration failed" };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    tokenManager.clearTokens();
    setUser(null);
    // Redirect to home page after logout
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
