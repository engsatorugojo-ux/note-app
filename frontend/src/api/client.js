import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "" });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const authApi = {
  register: (d) => api.post("/api/auth/register", d),
  login:    (d) => api.post("/api/auth/login", d),
};

export const notesApi = {
  list:   (q, sort) => api.get("/api/notes", { params: { q, sort } }),
  create: (d)       => api.post("/api/notes", d),
  update: (id, d)   => api.put(`/api/notes/${id}`, d),
  delete: (id)      => api.delete(`/api/notes/${id}`),
};
