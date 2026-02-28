"use client";

import { SWRConfig } from "swr";
import { type ReactNode } from "react";
import { fetcher } from "./fetcher";

interface SWRProviderProps {
  children: ReactNode;
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnMount: true,
        shouldRetryOnError: false,
        dedupingInterval: 2000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
