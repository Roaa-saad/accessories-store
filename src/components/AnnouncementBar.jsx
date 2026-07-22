import { useCallback, useEffect, useMemo, useState } from "react";
import { getPublicAnnouncement } from "../api/announcementApi";
import "./AnnouncementBar.css";

const REFRESH_INTERVAL = 30000;

const AnnouncementGroup = ({ messages, hidden = false }) => (
  <div className="announcement-group" aria-hidden={hidden}>
    {messages.map((message, index) => (
      <div className="announcement-item" key={`${message}-${index}`}>
        <span>{message}</span>
        <span className="announcement-separator" aria-hidden="true">
          ✦
        </span>
      </div>
    ))}
  </div>
);

const AnnouncementBar = () => {
  const [settings, setSettings] = useState(null);

  const loadAnnouncement = useCallback(async () => {
    try {
      const data = await getPublicAnnouncement();
      setSettings(data);
    } catch (error) {
      // Keep the last successful value if a temporary request fails.
      console.error("Failed to load announcement bar:", error);
    }
  }, []);

  useEffect(() => {
    loadAnnouncement();

    const intervalId = window.setInterval(
      loadAnnouncement,
      REFRESH_INTERVAL
    );

    const handleAnnouncementUpdate = () => loadAnnouncement();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadAnnouncement();
      }
    };

    window.addEventListener(
      "announcementUpdated",
      handleAnnouncementUpdate
    );
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(
        "announcementUpdated",
        handleAnnouncementUpdate
      );
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [loadAnnouncement]);

  const messages = useMemo(
    () =>
      (settings?.content || "")
        .split("\n")
        .map((message) => message.trim())
        .filter(Boolean),
    [settings?.content]
  );

  if (!settings?.is_active || messages.length === 0) {
    return null;
  }

  const totalCharacters = messages.join("").length;
  const animationDuration = Math.max(18, totalCharacters * 0.16);

  return (
    <section
      className="announcement-bar"
      aria-label="Store announcements"
      style={{ "--announcement-duration": `${animationDuration}s` }}
    >
      <div className="announcement-track">
        <AnnouncementGroup messages={messages} />
        <AnnouncementGroup messages={messages} hidden />
      </div>
    </section>
  );
};

export default AnnouncementBar;
