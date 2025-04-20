import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { hashPassword } from "@/lib/crypto";
import { useTranslation } from "@/i18n/i18n";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<SelectUser, "password">, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<SelectUser, "password">, Error, InsertUser>;
  deleteAccountMutation: UseMutationResult<void, Error, void>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // Hash the password before sending
      const hashedCredentials = {
        ...credentials,
        password: hashPassword(credentials.password),
      };
      
      const res = await apiRequest("POST", "/api/login", hashedCredentials);
      return await res.json();
    },
    onSuccess: (user: Omit<SelectUser, "password">) => {
      queryClient.setQueryData(["/api/user"], user);
      setLocation("/");
      toast({
        title: t("login.success"),
        description: t("login.welcome", { username: user.username }),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("login.failed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      // Hash the password before sending
      const hashedCredentials = {
        ...credentials,
        password: hashPassword(credentials.password),
      };
      
      const res = await apiRequest("POST", "/api/register", hashedCredentials);
      return await res.json();
    },
    onSuccess: (user: Omit<SelectUser, "password">) => {
      queryClient.setQueryData(["/api/user"], user);
      setLocation("/");
      toast({
        title: t("register.success"),
        description: t("register.welcome"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("register.failed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      setLocation("/auth");
      toast({
        title: t("logout.success"),
        description: t("logout.message"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("logout.failed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/user");
    },
    onSuccess: () => {
      // Clear all local storage
      localStorage.clear();
      
      // Clear query cache
      queryClient.clear();
      
      // Redirect to auth page
      setLocation("/auth");
      
      toast({
        title: t("account.deleted"),
        description: t("account.deletedMessage"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("account.deleteFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        deleteAccountMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
