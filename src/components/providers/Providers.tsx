"use client";
import { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { LangProvider } from "./LangProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LangProvider>{children}</LangProvider>
    </ThemeProvider>
  );
}
