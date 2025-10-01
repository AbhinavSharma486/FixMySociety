import axios from "axios";

const envBase = (import.meta.env.VITE_API_BASE || import.meta.env.VITE_BACKEND || "").replace(/\/$/, "");
// Point base to backend root, not /api. Callers already prefix paths with /api/...
const baseURL = envBase
  ? envBase
  : (import.meta.env.MODE === "development" ? "http://localhost:5001" : "");

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});