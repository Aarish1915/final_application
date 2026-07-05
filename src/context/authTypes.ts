import { createContext } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  gender?: string;
  dateOfBirth?: string;
  createdAt?: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
