import { createContext } from "react";

export type UserRole = "admin" | "teacher" | "student";
export const UserRoleContext = createContext<UserRole>("student"); 