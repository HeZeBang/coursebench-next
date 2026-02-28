interface UserLike {
  nickname?: string;
  realname?: string;
  id?: number;
  email?: string;
}

/**
 * Display name priority: nickname > realname > User_{id} > email
 * For anonymous users, returns "匿名用户"
 */
export function getUserDisplayName(
  user: UserLike,
  isAnonymous = false
): string {
  if (isAnonymous) return "匿名用户";
  if (user.nickname) return user.nickname;
  if (user.realname) return user.realname;
  if (user.id) return `User_${user.id}`;
  if (user.email) return user.email;
  return "未知用户";
}
