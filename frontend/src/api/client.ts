import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiErrorShape {
  message: string;
  errors?: { msg: string; path?: string }[];
}

/** Extracts a human-readable message from an axios error thrown by the API. */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorShape | undefined;
    if (data?.errors?.length) return data.errors.map((e) => e.msg).join(", ");
    if (data?.message) return data.message;
    return err.message;
  }
  return err instanceof Error ? err.message : "Something went wrong";
}

export default api;
