"use client";

import { useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
}

export default function Turnstile({
  onVerify,
  onExpire,
  theme = "auto",
  size = "normal",
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: onVerify,
      "expired-callback": () => {
        onExpire?.();
      },
      "error-callback": () => {
        onExpire?.();
      },
      theme,
      size,
    });
  }, [onVerify, onExpire, theme, size]);

  useEffect(() => {
    // Load the Turnstile script if not already loaded
    if (!document.querySelector('script[src*="turnstile"]')) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        scriptLoadedRef.current = true;
        renderWidget();
      };
      document.head.appendChild(script);
    } else if (window.turnstile) {
      scriptLoadedRef.current = true;
      renderWidget();
    } else {
      // Script tag exists but hasn't loaded yet — poll briefly
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          scriptLoadedRef.current = true;
          renderWidget();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [renderWidget]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  return <Box ref={containerRef} sx={{ display: "flex", justifyContent: "center", my: 1 }} />;
}
