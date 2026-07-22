import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://accessories-backend-production.up.railway.app";

const announcementClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.detail || error?.message || fallback;

export const getPublicAnnouncement = async () => {
  try {
    const response = await announcementClient.get("/announcement", {
      params: { _t: Date.now() },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to load the announcement bar")
    );
  }
};

export const getAdminAnnouncement = async () => {
  const token = localStorage.getItem("admin_token");

  try {
    const response = await announcementClient.get("/admin/announcement", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { _t: Date.now() },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to load announcement settings")
    );
  }
};

export const updateAdminAnnouncement = async (payload) => {
  const token = localStorage.getItem("admin_token");

  try {
    const response = await announcementClient.put(
      "/admin/announcement",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Failed to update announcement settings")
    );
  }
};
