"use client";

import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import toast from "react-hot-toast";

export default function AuthInterceptor({ children }) {
  const dispatch = useDispatch();
  const { userAndToken } = useSelector((state) => state.auth);
  const language = useSelector((state) => state.language?.language);
  const isBangla = language === "bn";

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          const url = error.config?.url || "";
          // Do not log out if it's the login endpoint returning 401 (e.g. invalid credentials)
          if (!url.includes("/api/users/auth/login")) {
            if (userAndToken) {
              dispatch(logout());
              toast.error(
                isBangla
                  ? "আপনার লগইন সেশন শেষ হয়ে গেছে। অনুগ্রহ করে আবার লগইন করুন।"
                  : "Your session has expired. Please sign in again."
              );
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [dispatch, userAndToken, isBangla]);

  return <>{children}</>;
}
