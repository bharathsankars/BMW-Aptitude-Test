import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE || "http://localhost:4000";
export const http = axios.create({ baseURL, headers: { "Content-Type": "application/json" } });
