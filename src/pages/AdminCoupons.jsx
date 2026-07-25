import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import {
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminCoupons,
  toggleAdminCoupon,
  updateAdminCoupon,
} from "../api/couponApi";
import "../styles/admin-dashboard.css";
import "./AdminCoupons.css";

const EMPTY_FORM = {
  code: "",
  discount_type: "percent",
  discount_value: "",
  min_order_amount: "0",
  usage_limit: "",
  expires_at: "",
  is_active: true,
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .slice(0, 16);
};

const buildPayload = (form) => ({
  code: form.code.trim().toUpperCase(),
  discount_type: form.discount_type,
  discount_value:
    form.discount_type === "gift" ? 0 : Number(form.discount_value),
  min_order_amount: Number(form.min_order_amount || 0),
  usage_limit: form.usage_limit === "" ? null : Number(form.usage_limit),
  expires_at: form.expires_at
    ? new Date(form.expires_at).toISOString()
    : null,
  is_active: Boolean(form.is_active),
});

const AdminCoupons = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const clearStatus = () => {
    setMessage("");
    setError("");
  };

  const loadCoupons = async () => {
    setError("");
    try {
      const data = await getAdminCoupons();
      setCoupons(data);
    } catch (loadError) {
      setError(loadError.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const updateFormField = (setter, field, value) => {
    setter((current) => ({ ...current, [field]: value }));
    clearStatus();
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    clearStatus();

    if (!form.code.trim()) {
      setError("Enter a coupon code first.");
      return;
    }

    if (form.discount_type !== "gift" && Number(form.discount_value) <= 0) {
      setError("Enter a valid discount value.");
      return;
    }

    setCreating(true);
    try {
      const created = await createAdminCoupon(buildPayload(form));
      setCoupons((current) => [created, ...current]);
      setForm(EMPTY_FORM);
      setMessage("Coupon added successfully.");
    } catch (createError) {
      setError(createError.message || "Failed to create coupon");
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (coupon) => {
    clearStatus();
    setEditingId(coupon.id);
    setEditForm({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value:
        coupon.discount_type === "gift" ? "" : String(coupon.discount_value),
      min_order_amount: String(coupon.min_order_amount || 0),
      usage_limit:
        coupon.usage_limit === null || coupon.usage_limit === undefined
          ? ""
          : String(coupon.usage_limit),
      expires_at: toDateTimeLocal(coupon.expires_at),
      is_active: coupon.is_active,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const saveEdit = async (couponId) => {
    clearStatus();
    setBusyId(couponId);

    try {
      const updated = await updateAdminCoupon(
        couponId,
        buildPayload(editForm)
      );
      setCoupons((current) =>
        current.map((coupon) =>
          coupon.id === couponId ? updated : coupon
        )
      );
      cancelEditing();
      setMessage("Coupon updated successfully.");
    } catch (updateError) {
      setError(updateError.message || "Failed to update coupon");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = async (couponId) => {
    clearStatus();
    setBusyId(couponId);

    try {
      const updated = await toggleAdminCoupon(couponId);
      setCoupons((current) =>
        current.map((coupon) =>
          coupon.id === couponId ? updated : coupon
        )
      );
      setMessage(
        updated.is_active
          ? "Coupon is now active."
          : "Coupon is now inactive."
      );
    } catch (toggleError) {
      setError(toggleError.message || "Failed to update coupon status");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (coupon) => {
    const confirmed = window.confirm(
      `Delete coupon ${coupon.code}? This cannot be undone.`
    );
    if (!confirmed) return;

    clearStatus();
    setBusyId(coupon.id);

    try {
      await deleteAdminCoupon(coupon.id);
      setCoupons((current) =>
        current.filter((item) => item.id !== coupon.id)
      );
      if (editingId === coupon.id) cancelEditing();
      setMessage("Coupon deleted successfully.");
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete coupon");
    } finally {
      setBusyId(null);
    }
  };

  const renderFields = (currentForm, setter, prefix) => (
    <div className="coupon-fields-grid">
      <label>
        <span>Coupon code</span>
        <input
          type="text"
          value={currentForm.code}
          maxLength={50}
          placeholder="SUMMER10"
          onChange={(event) =>
            updateFormField(
              setter,
              "code",
              event.target.value.toUpperCase().replace(/\s+/g, "")
            )
          }
          required
        />
      </label>

      <label>
        <span>Discount type</span>
        <select
          value={currentForm.discount_type}
          onChange={(event) =>
            updateFormField(setter, "discount_type", event.target.value)
          }
        >
          <option value="percent">Percentage</option>
          <option value="fixed">Fixed amount</option>
          <option value="gift">Free gift</option>
        </select>
      </label>

      <label>
        <span>
          {currentForm.discount_type === "percent"
            ? "Discount percentage"
            : "Discount value"}
        </span>
        <input
          type="number"
          min="0"
          max={currentForm.discount_type === "percent" ? "100" : undefined}
          step="0.01"
          value={currentForm.discount_value}
          disabled={currentForm.discount_type === "gift"}
          placeholder={currentForm.discount_type === "gift" ? "0" : "10"}
          onChange={(event) =>
            updateFormField(setter, "discount_value", event.target.value)
          }
        />
      </label>

      <label>
        <span>Minimum order (EGP)</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={currentForm.min_order_amount}
          onChange={(event) =>
            updateFormField(setter, "min_order_amount", event.target.value)
          }
        />
      </label>

      <label>
        <span>Usage limit</span>
        <input
          type="number"
          min="1"
          step="1"
          value={currentForm.usage_limit}
          placeholder="Unlimited"
          onChange={(event) =>
            updateFormField(setter, "usage_limit", event.target.value)
          }
        />
      </label>

      <label>
        <span>Expiry date</span>
        <input
          type="datetime-local"
          value={currentForm.expires_at}
          onChange={(event) =>
            updateFormField(setter, "expires_at", event.target.value)
          }
        />
      </label>

      <label className="coupon-active-check" htmlFor={`${prefix}-active`}>
        <input
          id={`${prefix}-active`}
          type="checkbox"
          checked={currentForm.is_active}
          onChange={(event) =>
            updateFormField(setter, "is_active", event.target.checked)
          }
        />
        <span>Active for customers</span>
      </label>
    </div>
  );

  return (
    <>
      <button
        className="sidebar-toggle"
        type="button"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="admin-content coupon-admin-page">
        <div className="coupon-page-header">
          <div>
            <h1 className="section-title">Coupons</h1>
            <p>Create, edit, activate, deactivate, or delete coupon codes.</p>
          </div>
          <span className="coupon-count">{coupons.length} coupons</span>
        </div>

        <form className="coupon-create-card" onSubmit={handleCreate}>
          <h2>Add new coupon</h2>
          {renderFields(form, setForm, "new-coupon")}
          <button className="coupon-primary-btn" type="submit" disabled={creating}>
            {creating ? "Adding..." : "Add Coupon"}
          </button>
        </form>

        {error && <p className="coupon-message error">{error}</p>}
        {message && <p className="coupon-message success">{message}</p>}

        <section className="coupon-list-section">
          <h2>Current coupons</h2>

          {loading ? (
            <div className="coupon-empty">Loading...</div>
          ) : coupons.length === 0 ? (
            <div className="coupon-empty">No coupons yet.</div>
          ) : (
            <div className="coupon-list">
              {coupons.map((coupon) => {
                const editing = editingId === coupon.id;
                const busy = busyId === coupon.id;

                return (
                  <article
                    className={`coupon-card ${coupon.is_active ? "active" : "inactive"}`}
                    key={coupon.id}
                  >
                    {editing ? (
                      <>
                        {renderFields(editForm, setEditForm, `edit-${coupon.id}`)}
                        <div className="coupon-actions">
                          <button
                            type="button"
                            className="coupon-action save"
                            onClick={() => saveEdit(coupon.id)}
                            disabled={busy}
                          >
                            {busy ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            className="coupon-action neutral"
                            onClick={cancelEditing}
                            disabled={busy}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="coupon-card-top">
                          <div>
                            <span className="coupon-code">{coupon.code}</span>
                            <span
                              className={`coupon-status ${coupon.is_active ? "active" : "inactive"}`}
                            >
                              {coupon.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <span className="coupon-used">
                            Used {coupon.times_used}
                            {coupon.usage_limit ? ` / ${coupon.usage_limit}` : " times"}
                          </span>
                        </div>

                        <div className="coupon-summary">
                          <span>
                            {coupon.discount_type === "percent"
                              ? `${coupon.discount_value}% off`
                              : coupon.discount_type === "fixed"
                                ? `${coupon.discount_value} EGP off`
                                : "Free gift"}
                          </span>
                          <span>Minimum: {coupon.min_order_amount} EGP</span>
                          <span>
                            Expires: {coupon.expires_at
                              ? new Date(coupon.expires_at).toLocaleString()
                              : "No expiry"}
                          </span>
                        </div>

                        <div className="coupon-actions">
                          <button
                            type="button"
                            className="coupon-action neutral"
                            onClick={() => startEditing(coupon)}
                            disabled={busy}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={`coupon-action ${coupon.is_active ? "hide" : "show"}`}
                            onClick={() => handleToggle(coupon.id)}
                            disabled={busy}
                          >
                            {busy
                              ? "Updating..."
                              : coupon.is_active
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                          <button
                            type="button"
                            className="coupon-action delete"
                            onClick={() => handleDelete(coupon)}
                            disabled={busy}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default AdminCoupons;
