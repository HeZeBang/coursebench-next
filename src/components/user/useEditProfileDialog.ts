"use client";

import { useState, useCallback } from "react";
import { useAuth, useAuthDispatch } from "@/contexts/AuthContext";
import { useSnackbar } from "@/contexts/SnackbarContext";
import api from "@/lib/api";
import type { UserProfile } from "@/types";

export interface EditProfileFormData {
  nickname: string;
  realname: string;
  year: number;
  grade: number;
  is_anonymous: boolean;
}

export interface EditProfileDialogState {
  /** Whether the dialog is open */
  dialogOpen: boolean;
  /** Current step: 0 = edit profile, 1 = change password */
  step: 0 | 1;
  /** Form data for profile editing */
  formData: EditProfileFormData;
  /** Password change form data */
  passwordData: {
    oldPassword: string;
    newPassword: string;
    captcha: string;
  };
  /** Key to force Turnstile re-mount */
  turnstileKey: number;
  /** Loading state */
  isLoading: boolean;
  /** Open the dialog */
  handleOpen: () => void;
  /** Close the dialog */
  handleClose: () => void;
  /** Update form data */
  updateFormData: (data: Partial<EditProfileFormData>) => void;
  /** Update password data */
  updatePasswordData: (
    data: Partial<{
      oldPassword: string;
      newPassword: string;
      captcha: string;
    }>,
  ) => void;
  /** Submit profile changes */
  handleSubmitProfile: () => Promise<void>;
  /** Submit password change */
  handleSubmitPassword: () => Promise<void>;
  /** Go to password change step */
  handleChangePassword: () => void;
  /** Go back to profile step */
  handleBack: () => void;
  /** Reset form to initial state */
  resetForm: () => void;
}

export function useEditProfileDialog(): EditProfileDialogState {
  const { userProfile } = useAuth();
  const dispatch = useAuthDispatch();
  const showSnackbar = useSnackbar();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<0 | 1>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileKey, setTurnstileKey] = useState(0);

  // Initialize form data from current profile
  const initialFormData: EditProfileFormData = {
    nickname: userProfile?.nickname ?? "",
    realname: userProfile?.realname ?? "",
    year: userProfile?.year ?? 0,
    grade: userProfile?.grade ?? 0,
    is_anonymous: userProfile?.is_anonymous ?? false,
  };

  const [formData, setFormData] =
    useState<EditProfileFormData>(initialFormData);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    captcha: "",
  });

  const handleOpen = useCallback(() => {
    if (!userProfile) {
      showSnackbar("请先登录", "warning");
      return;
    }
    setFormData(initialFormData);
    setPasswordData({ oldPassword: "", newPassword: "", captcha: "" });
    setStep(0);
    setDialogOpen(true);
  }, [userProfile, showSnackbar, initialFormData]);

  const handleClose = useCallback(() => {
    setDialogOpen(false);
    setStep(0);
  }, []);

  const updateFormData = useCallback((data: Partial<EditProfileFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const updatePasswordData = useCallback(
    (data: Partial<{ oldPassword: string; newPassword: string }>) => {
      setPasswordData((prev) => ({ ...prev, ...data }));
    },
    [],
  );

  const handleSubmitProfile = useCallback(async () => {
    if (!formData.nickname.trim()) {
      showSnackbar("用户名不能为空", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/v1/user/update_profile", {
        nickname: formData.nickname,
        realname: formData.realname,
        year: formData.year,
        grade: formData.grade,
        is_anonymous: formData.is_anonymous,
      });

      // Update auth context
      dispatch({
        type: "UPDATE_PROFILE",
        payload: formData,
      });

      showSnackbar("个人信息已更新", "success");
      handleClose();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.msg || "更新个人信息失败，请重试";
      showSnackbar(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  }, [formData, dispatch, showSnackbar, handleClose]);

  const handleSubmitPassword = useCallback(async () => {
    if (!passwordData.oldPassword.trim()) {
      showSnackbar("请输入旧密码", "error");
      return;
    }

    if (!passwordData.newPassword.trim()) {
      showSnackbar("请输入新密码", "error");
      return;
    }

    if (passwordData.oldPassword === passwordData.newPassword) {
      showSnackbar("新密码不能与旧密码相同", "error");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/v1/user/update_password", {
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
        captcha: passwordData.captcha,
      });

      showSnackbar("密码已修改", "success");
      setPasswordData({ oldPassword: "", newPassword: "", captcha: "" });
      setStep(0);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.msg || "修改密码失败，请重试";
      showSnackbar(errorMsg, "error");
      setPasswordData((prev) => ({ ...prev, captcha: "" }));
      setTurnstileKey((k) => k + 1);
    } finally {
      setIsLoading(false);
    }
  }, [passwordData, showSnackbar]);

  const handleChangePassword = useCallback(() => {
    setStep(1);
  }, []);

  const handleBack = useCallback(() => {
    setStep(0);
    setPasswordData({ oldPassword: "", newPassword: "", captcha: "" });
    setTurnstileKey((k) => k + 1);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setPasswordData({ oldPassword: "", newPassword: "", captcha: "" });
  }, [initialFormData]);

  return {
    dialogOpen,
    step,
    formData,
    passwordData,
    turnstileKey,
    isLoading,
    handleOpen,
    handleClose,
    updateFormData,
    updatePasswordData,
    handleSubmitProfile,
    handleSubmitPassword,
    handleChangePassword,
    handleBack,
    resetForm,
  };
}
