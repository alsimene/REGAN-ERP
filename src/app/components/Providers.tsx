"use client";

import { ThemeProvider } from "@/app/context/ThemeContext";
import { AuthProvider } from "@/app/context/AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
