import { useCallback, useEffect, useState } from "react";
import { AuthAPI } from "../api/endpoints";
import { getAuthToken, setAuthToken } from "../api/client";
import type { AuthResponse, User } from "../api/types";

interface UseAuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface UseAuthResult extends UseAuthState {
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (payload: {
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    role: User["role"];
    password: string;
  }) => Promise<AuthResponse>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  token: string | null;
}

const TOKEN_KEY = "nursingSystem.jwt";

export const useAuth = (): UseAuthResult => {
  const [state, setState] = useState<UseAuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const [token, setTokenState] = useState<string | null>(() => getAuthToken());

  const applyAuthResponse = useCallback((response: AuthResponse) => {
    setAuthToken(response.token);
    setTokenState(response.token);
    setState({ user: response.user, loading: false, error: null });
    return response;
  }, []);

  const refreshProfile = useCallback(async () => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const profile = await AuthAPI.me();
      setState({ user: profile, loading: false, error: null });
    } catch (error) {
      setAuthToken(null);
      setTokenState(null);
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        if (!email || !password) {
          throw new Error("メールアドレスとパスワードを入力してください");
        }
        const response = await AuthAPI.login({ email, password });
        return applyAuthResponse(response);
      } catch (error: any) {
        const message =
          error?.response?.data?.message ??
          error?.message ??
          "ログインに失敗しました。メールアドレスとパスワードを確認してください";
        setState({ user: null, loading: false, error: message });
        throw error;
      }
    },
    [applyAuthResponse]
  );

  const register = useCallback(
    async (payload: {
      first_name?: string;
      last_name?: string;
      email: string;
      phone?: string;
      role: User["role"];
      password: string;
    }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        if (!payload.email || !payload.password) {
          throw new Error("メールアドレスとパスワードは必須です");
        }
        if (payload.password.length < 6) {
          throw new Error("パスワードは6文字以上である必要があります");
        }
        const response = await AuthAPI.register(payload);
        return applyAuthResponse(response);
      } catch (error: any) {
        const message =
          error?.response?.data?.message ??
          error?.message ??
          "登録に失敗しました。入力内容を確認してください";
        setState({ user: null, loading: false, error: message });
        throw error;
      }
    },
    [applyAuthResponse]
  );

  const logout = useCallback(() => {
    setAuthToken(null);
    setTokenState(null);
    setState({ user: null, loading: false, error: null });
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    refreshProfile,
    token,
  };
};

