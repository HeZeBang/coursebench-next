"use client";

import { forwardRef } from "react";
import Avatar, { type AvatarProps } from "@mui/material/Avatar";
import { getUserDisplayName } from "@/utils";
import type { UserProfile } from "@/types";

interface UserAvatarProps extends Omit<AvatarProps, "src" | "children"> {
  /** User profile object */
  userProfile: UserProfile | null;
  /** Avatar size in pixels
   * @default 32
   */
  size?: number;
}

/**
 * User avatar component with fallback initials
 *
 * Features:
 * - Displays user avatar if available
 * - Falls back to user's name initial
 * - Customizable size and styling
 *
 * @example
 * import UserAvatar from "@/components/user/UserAvatar";
 *
 * <UserAvatar userProfile={user} />
 * <UserAvatar userProfile={user} size={48} />
 */
const UserAvatar = forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ userProfile, size = 32, sx = {}, ...props }, ref) => {
    const displayName = (userProfile && getUserDisplayName(userProfile)) || "?";
    const initial = displayName.charAt(0);

    return (
      <Avatar
        ref={ref}
        src={userProfile?.avatar || undefined}
        sx={{
          width: size,
          height: size,
          fontSize: size / 2,
          bgcolor: "primary.main",
          color: "white",
          pb: "0.1rem",
          ...sx,
        }}
        {...props}
      >
        {initial}
      </Avatar>
    );
  },
);

UserAvatar.displayName = "UserAvatar";

export default UserAvatar;
