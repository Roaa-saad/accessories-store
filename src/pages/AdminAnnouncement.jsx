import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import {
  createAdminAnnouncement,
  deleteAdminAnnouncement,
  getAdminAnnouncements,
  toggleAdminAnnouncement,
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
  const [announcements, setAnnouncements] = useState([]);
  const [newForm, setNewForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const notifyCustomerBar = () => {
    window.dispatchEvent(new Event("announcementUpdated"));
  };

  const loadAnnouncements = async () => {
    setError("");

    try {
      const data = await getAdminAnnouncements();
      setAnnouncements(data);
    } catch (loadError) {
      setError(loadError.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const clearStatus = () => {
    setMessage("");
    setError("");
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    clearStatus();

    const content = newForm.content.trim();
    if (!content) {
      setError("Write the announcement text first.");
      return;
    }

    setCreating(true);

    try {
      const created = await createAdminAnnouncement({
        content,
        is_active: newForm.is_active,
      });

      setAnnouncements((current) => [...current, created]);
      setNewForm(EMPTY_FORM);
      setMessage("Announcement added successfully.");
      notifyCustomerBar();
    } catch (createError) {
      setError(createError.message || "Failed to add announcement");
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (announcement) => {
    clearStatus();
    setEditingId(announcement.id);
    setEditContent(announcement.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
  };

  const saveEdit = async (announcement) => {
    clearStatus();

    const content = editContent.trim();
    if (!content) {
      setError("Announcement text cannot be empty.");
      return;
    }

    setActionId(announcement.id);

    try {
      const updated = await updateAdminAnnouncement(announcement.id, {
        content,
      });

      setAnnouncements((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );

      cancelEditing();
      setMessage("Announcement updated successfully.");
      notifyCustomerBar();
    } catch (updateError) {
      setError(updateError.message || "Failed to update announcement");
    } finally {
      setActionId(null);
    }
  };

  const handleToggle = async (announcement) => {
    clearStatus();
    setActionId(announcement.id);

    try {
      const updated = await toggleAdminAnnouncement(announcement.id);

      setAnnouncements((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );

      setMessage(
        updated.is_active
          ? "Announcement is now visible to customers."
          : "Announcement is now hidden from customers."
      );
      notifyCustomerBar();
    } catch (toggleError) {
      setError(
        toggleError.message || "Failed to change announcement visibility"
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (announcement) => {
    const confirmed = window.confirm(
      `Delete this announcement?\n\n${announcement.content}`
    );

    if (!confirmed) {
      return;
    }

    clearStatus();
    setActionId(announcement.id);

    try {
      await deleteAdminAnnouncement(announcement.id);

      setAnnouncements((current) =>
        current.filter((item) => item.id !== announcement.id)
      );

      if (editingId === announcement.id) {
        cancelEditing();
      }

      setMessage("Announcement deleted successfully.");
      notifyCustomerBar();
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete announcement");
    } finally {
      setActionId(null);
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
        <div className="announcement-page-header">
          <div>
            <h1 className="section-title">Announcement Bar</h1>
            <p>
              Add, edit, hide, show, or delete each announcement separately.
            </p>
          </div>

          <span className="announcement-count">
            {announcements.length} announcement
            {announcements.length === 1 ? "" : "s"}
          </span>
        </div>

        <form className="announcement-create-card" onSubmit={handleCreate}>
          <label htmlFor="new-announcement">Add new announcement</label>

          <div className="announcement-create-row">
            <input
              id="new-announcement"
              type="text"
              value={newForm.content}
              maxLength={300}
              placeholder="Example: Free Shipping on orders over 900 EGP"
              onChange={(event) => {
                setNewForm((current) => ({
                  ...current,
                  content: event.target.value,
                }));
                clearStatus();
              }}
              disabled={creating}
            />

            <button
              className="announcement-primary-button"
              type="submit"
              disabled={creating}
            >
              {creating ? "Adding..." : "Add Announcement"}
            </button>
          </div>

          <div className="announcement-create-footer">
            <label className="announcement-checkbox-row">
              <input
                type="checkbox"
                checked={newForm.is_active}
                onChange={(event) =>
                  setNewForm((current) => ({
                    ...current,
                    is_active: event.target.checked,
                  }))
                }
                disabled={creating}
              />
              <span>Show it to customers immediately</span>
            </label>

            <span>{newForm.content.length} / 300</span>
          </div>
        </form>

        {error && <p className="announcement-status error">{error}</p>}
        {message && (
          <p className="announcement-status success">{message}</p>
        )}

        <section className="announcement-list-section">
          <h2>Current announcements</h2>

          {loading ? (
            <div className="announcement-empty-state">Loading...</div>
          ) : announcements.length === 0 ? (
            <div className="announcement-empty-state">
              No announcements yet. Add the first announcement above.
            </div>
          ) : (
            <div className="announcement-list">
              {announcements.map((announcement) => {
                const isEditing = editingId === announcement.id;
                const isBusy = actionId === announcement.id;

                return (
                  <article
                    className={`announcement-list-card ${
                      announcement.is_active ? "active" : "hidden"
                    }`}
                    key={announcement.id}
                  >
                    <div className="announcement-card-main">
                      <div className="announcement-card-heading">
                        <span
                          className={`announcement-status-badge ${
                            announcement.is_active ? "visible" : "hidden"
                          }`}
                        >
                          {announcement.is_active ? "Visible" : "Hidden"}
                        </span>
                        <span className="announcement-id">
                          #{announcement.id}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="announcement-edit-area">
                          <input
                            type="text"
                            value={editContent}
                            maxLength={300}
                            onChange={(event) =>
                              setEditContent(event.target.value)
                            }
                            disabled={isBusy}
                            autoFocus
                          />
                          <span>{editContent.length} / 300</span>
                        </div>
                      ) : (
                        <p className="announcement-card-text">
                          {announcement.content}
                        </p>
                      )}
                    </div>

                    <div className="announcement-card-actions">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            className="announcement-action save"
                            onClick={() => saveEdit(announcement)}
                            disabled={isBusy}
                          >
                            {isBusy ? "Saving..." : "Save"}
                          </button>

                          <button
                            type="button"
                            className="announcement-action neutral"
                            onClick={cancelEditing}
                            disabled={isBusy}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="announcement-action neutral"
                          onClick={() => startEditing(announcement)}
                          disabled={isBusy}
                        >
                          Edit
                        </button>
                      )}

                      <button
                        type="button"
                        className={`announcement-action ${
                          announcement.is_active ? "hide" : "show"
                        }`}
                        onClick={() => handleToggle(announcement)}
                        disabled={isBusy}
                      >
                        {isBusy
                          ? "Updating..."
                          : announcement.is_active
                            ? "Hide"
                            : "Show"}
                      </button>

                      <button
                        type="button"
                        className="announcement-action delete"
                        onClick={() => handleDelete(announcement)}
                        disabled={isBusy}
                      >
                        Delete
                      </button>
                    </div>
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

export default AdminAnnouncement;