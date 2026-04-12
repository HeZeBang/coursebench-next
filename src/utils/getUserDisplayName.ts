interface UserLike {
  nickname?: string;
  realname?: string;
  id?: number;
  email?: string;
}

/**
 * Display name priority: nickname > realname > User_{id} > email
 * For anonymous users where user is null, returns "匿名用户".
 * For own anonymous posts (user is present but isAnonymous=true), returns "昵称（匿名）".
 */
export function getUserDisplayName(
  user: UserLike | null | undefined,
  isAnonymous = false,
): string {
  if (!user) return "匿名用户";
  if (isAnonymous) {
    // User info present means viewing own anonymous post
    const name = user.nickname || user.realname || `User_${user.id}`;
    return `${name}（匿名）`;
  }
  if (user.nickname) return user.nickname;
  if (user.realname) return user.realname;
  if (user.id) return `User_${user.id}`;
  if (user.email) return user.email;
  return "未知用户";
}
