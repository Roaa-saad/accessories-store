import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://accessories-backend-production.up.railway.app";

const couponClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

couponClient.interceptors.response.use(
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

const adminHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("admin_token") || ""}`,
});

const errorMessage = (error, fallback) =>
  error?.response?.data?.detail || error?.message || fallback;

export const getAdminCoupons = async () => {
  try {
    const response = await couponClient.get("/admin/coupons", {
      headers: adminHeaders(),
      params: { _t: Date.now() },
    });

    return Array.isArray(response.data?.coupons)
      ? response.data.coupons
      : [];
  } catch (error) {
    throw new Error(errorMessage(error, "Failed to load coupons"));
  }
};

export const createAdminCoupon = async (payload) => {
  try {
    const response = await couponClient.post("/admin/coupons", payload, {
      headers: adminHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(errorMessage(error, "Failed to create coupon"));
  }
};

export const updateAdminCoupon = async (id, payload) => {
  try {
    const response = await couponClient.put(`/admin/coupons/${id}`, payload, {
      headers: adminHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(errorMessage(error, "Failed to update coupon"));
  }
};

export const toggleAdminCoupon = async (id) => {
  try {
    const response = await couponClient.patch(
      `/admin/coupons/${id}/toggle`,
      {},
      { headers: adminHeaders() }
    );
    return response.data;
  } catch (error) {
    throw new Error(errorMessage(error, "Failed to update coupon status"));
  }
};

export const deleteAdminCoupon = async (id) => {
  try {
    const response = await couponClient.delete(`/admin/coupons/${id}`, {
      headers: adminHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error(errorMessage(error, "Failed to delete coupon"));
  }
};
