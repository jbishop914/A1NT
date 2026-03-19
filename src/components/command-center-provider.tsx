"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  type CommandCenterSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
} from "@/lib/command-center-store";

interface CCContextValue {
  settings: CommandCenterSettings;
  update: (patch: Partial<CommandCenterSettings>) => void;
  reset: () => void;
}

const CCContext = createContext<CCContextValue>({
  settings: DEFAULT_SETTINGS,
  update: () => {},
  reset: () => {},
});

export function CommandCenterProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<CommandCenterSettings>(DEFAULT_SETTINGS);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const update = useCallback((patch: Partial<CommandCenterSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <CCContext.Provider value={{ settings, update, reset }}>
      {children}
    </CCContext.Provider>
  );
}

export function useCommandCenter() {
  return useContext(CCContext);
}
