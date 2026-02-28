/** User profile from /v1/user/profile/:id */
export interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  realname: string;
  grade: number;         // 0=unknown, 1=本科, 2=硕士, 3=博士
  year: number;
  avatar: string;
  is_anonymous: boolean;
  is_admin: boolean;
  is_community_admin: boolean;
  invitation_code: string;
  reward: number;        // -1 if hidden
  has_casdoor_bound: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  captcha: string;
  captcha_id: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
  realname?: string;
  grade: string;
  year: number;
  captcha: string;
  captcha_id: string;
  invitation_code?: string;
}

export interface CaptchaResponse {
  img: string;
}
