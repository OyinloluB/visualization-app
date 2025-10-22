import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export async function postQuery(query, currentViz = null) {
  const { data } = await api.post("/api/query", {
    query,
    currentViz: currentViz,
  });
  return data;
}

export async function health() {
  const { data } = await api.get("/health");
  return data;
}
