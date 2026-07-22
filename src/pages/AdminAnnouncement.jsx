import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import {
  getAdminAnnouncement,
  updateAdminAnnouncement,
} from "../api/announcementApi";
import "../styles/admin-dashboard.css";
import "./AdminAnnouncement.css";

const EMPTY_FORM = {
  content: "",
  is_active: true,
};

const AdminAnnouncement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        const data = await getAdminAnnouncement();

        if (!cancelled) {
          setForm({
            content: data?.content || "",
            is_active: Boolean(data?.is_active),
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Failed to load announcement");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const previewMessages = useMemo(
    () =>
      form.content
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    [form.content]
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanedContent = form.content
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .join("\n");

    if (form.is_active && !cleanedContent) {
      setError("Write at least one announcement before activating the bar.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const updated = await updateAdminAnnouncement({
        content: cleanedContent,
        is_active: form.is_active,
      });

      setForm({
        content: updated.content || "",
        is_active: Boolean(updated.is_active),
      });

      window.dispatchEvent(new Event("announcementUpdated"));
      setMessage("Announcement bar updated successfully.");
    } catch (saveError) {
      setError(saveError.message || "Failed to update announcement");
    } finally {
      setSaving(false);
    }
  };

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

      <main className="admin-content announcement-admin-page">
        <h1 className="section-title">Announcement Bar</h1>

        <form className="announcement-admin-card" onSubmit={handleSubmit}>
          <label htmlFor="announcement-content">
            Announcement text
          </label>

          <textarea
            id="announcement-content"
            name="content"
            value={form.content}
            onChange={handleChange}
            maxLength={600}
            rows={7}
            placeholder={
              "Free Shipping on orders over 900 EGP\nNew pieces added regularly"
            }
            disabled={loading || saving}
          />

          <p className="announcement-help">
            Write each announcement on a separate line.
          </p>

          <div className="announcement-character-count">
            {form.content.length} / 600
          </div>

          <label className="announcement-switch-row">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              disabled={loading || saving}
            />
            <span>Show the announcement bar to customers</span>
          </label>

          {form.is_active && previewMessages.length > 0 && (
            <div className="announcement-admin-preview">
              {previewMessages.map((item, index) => (
                <span key={`${item}-${index}`}>
                  {item}
                  <b>✦</b>
                </span>
              ))}
            </div>
          )}

          {error && <p className="announcement-status error">{error}</p>}
          {message && (
            <p className="announcement-status success">{message}</p>
          )}

          <button
            className="announcement-save-button"
            type="submit"
            disabled={loading || saving}
          >
            {loading
              ? "Loading..."
              : saving
                ? "Saving..."
                : "Save Changes"}
          </button>
        </form>
      </main>
    </>
  );
};

export default AdminAnnouncement;
