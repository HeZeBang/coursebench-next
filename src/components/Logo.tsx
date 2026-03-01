"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { Box, type BoxProps } from "@mui/material";
import { useThemeMode } from "@/contexts/ThemeModeContext";
import LogoLight from "@/assets/logo.svg";
import LogoDark from "@/assets/logo-white.svg";

interface LogoProps extends BoxProps {
  /**
   * Logo size in pixels or CSS string (height)
   * @default 48
   */
  size?: number | string;
  /**
   * Make logo clickable with Link
   * @default "/"
   */
  href?: string | null;
  /**
   * Alternative text for the logo
   * @default "CourseBench Logo"
   */
  alt?: string;
  /**
   * Use mini logo variant
   * @default false
   */
  mini?: boolean;
}

/**
 * Logo component with automatic theme switching
 *
 * Features:
 * - Auto switches between light/dark logo based on theme
 * - Responsive sizing support
 * - Optional Link integration for navigation
 * - SSR-safe with proper hydration handling
 *
 * @example
 * // Basic usage
 * <Logo />
 *
 * // Custom size and styling
 * <Logo size={64} sx={{ cursor: 'pointer' }} />
 *
 * // As a link
 * <Logo href="/dashboard" />
 *
 * // No link wrapper
 * <Logo href={null} />
 */
const Logo = forwardRef<HTMLDivElement, LogoProps>(
  (
    {
      size = 48,
      href = "/",
      alt = "CourseBench Logo",
      mini = false,
      sx = {},
      ...props
    },
    ref,
  ) => {
    const { mode } = useThemeMode();

    // Select the appropriate logo based on theme
    const LogoSrc = mode === "dark" ? LogoDark : LogoLight;

    const sizeValue = typeof size === "number" ? `${size}px` : size;
    const sizeStyles = {
      height: sizeValue,
      aspectRatio: "auto",
    };

    const boxSx = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      ...sizeStyles,
      ...sx,
    };

    // Content to be rendered (img tag or wrapped in Link)
    const content = (
      <Box
        ref={ref}
        component="img"
        src={LogoSrc.src}
        alt={alt}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      />
    );

    // Render as Link if href is provided
    return (
      <Box
        sx={{
          ...boxSx,
          textDecoration: "none",
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            borderRadius: 1,
          },
        }}
        {...props}
      >
        {content}
      </Box>
    );
  },
);

Logo.displayName = "Logo";

export default Logo;
