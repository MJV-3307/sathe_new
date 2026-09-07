import { api } from "./client";

export const facultyApi = {
  list: (department) => api.get(`/faculty${department ? `?department=${encodeURIComponent(department)}` : ""}`),
  create: (payload) => api.post("/faculty", payload),
  update: (id, payload) => api.patch(`/faculty/${id}`, payload),
  remove: (id) => api.del(`/faculty/${id}`),
};

export const roomsApi = {
  list: () => api.get("/rooms"),
  create: (payload) => api.post("/rooms", payload),
  updateStatus: (id, status) => api.patch(`/rooms/${id}/status?status_value=${encodeURIComponent(status)}`),
};

export const subjectsApi = {
  list: (department, semester) => {
    const params = new URLSearchParams();
    if (department) params.set("department", department);
    if (semester) params.set("semester", semester);
    const qs = params.toString();
    return api.get(`/subjects${qs ? `?${qs}` : ""}`);
  },
  create: (payload) => api.post("/subjects", payload),
  remove: (id) => api.del(`/subjects/${id}`),
};

export const timetableApi = {
  get: (department, semester) =>
    api.get(`/timetable?department=${encodeURIComponent(department)}&semester=${encodeURIComponent(semester)}`),
  generate: (payload) => api.post("/timetable/generate", payload),
  move: (payload) => api.post("/timetable/move", payload),
  publish: (department, semester) => api.post("/timetable/publish", { department, semester }),
};

export const leaveApi = {
  list: () => api.get("/leave"),
  apply: (payload) => api.post("/leave", payload),
  assignProxy: (id, proxyName) => api.patch(`/leave/${id}/assign-proxy`, { proxy_name: proxyName }),
  decline: (id) => api.patch(`/leave/${id}/decline`),
};
