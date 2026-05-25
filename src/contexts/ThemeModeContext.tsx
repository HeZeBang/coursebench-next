"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  type ReactNode,
} from "react";

type ThemeMode = "light" | "dark";

interface ThemeModeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(
  undefined,
);

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useIsomorphicLayoutEffect(() => {
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode;
    if (savedMode === "dark" || savedMode === "light") {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme-mode", mode);
    document.body.classList.remove("light", "dark");
    document.body.classList.add(mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (context === undefined) {
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  }
  return context;
}
