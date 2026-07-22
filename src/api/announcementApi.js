import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://accessories-backend-production.up.railway.app";

const announcementClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

announcementClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("admin_token");

      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  }
);

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.detail || error?.message || fallback;

const getAdminHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token") || ""}`,
});

export const getPublicAnnouncements = async () => {
  try {
    const response = await announcementClient.get("/announcement", {
      params: { _t: Date.now() },
    });

    return Array.isArray(response.data?.announcements)
      ? response.data.announcements
      : [];
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to load the announcement bar")
    );
  }
};

export const getAdminAnnouncements = async () => {
  try {
    const response = await announcementClient.get("/admin/announcements", {
      headers: getAdminHeaders(),
      params: { _t: Date.now() },
    });

    return Array.isArray(response.data?.announcements)
      ? response.data.announcements
      : [];
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to load announcements")
    );
  }
};

export const createAdminAnnouncement = async (payload) => {
  try {
    const response = await announcementClient.post(
      "/admin/announcements",
      payload,
      { headers: getAdminHeaders() }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to create announcement")
    );
  }
};

export const updateAdminAnnouncement = async (id, payload) => {
  try {
    const response = await announcementClient.put(
      `/admin/announcements/${id}`,
      payload,
      { headers: getAdminHeaders() }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to update announcement")
    );
  }
};

export const toggleAdminAnnouncement = async (id) => {
  try {
    const response = await announcementClient.patch(
      `/admin/announcements/${id}/toggle`,
      {},
      { headers: getAdminHeaders() }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to change announcement visibility")
    );
  }
};

export const deleteAdminAnnouncement = async (id) => {
  try {
    const response = await announcementClient.delete(
      `/admin/announcements/${id}`,
      { headers: getAdminHeaders() }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to delete announcement")
    );
  }
};
