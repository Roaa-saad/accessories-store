import { useCallback, useEffect, useMemo, useState } from "react";
import { getPublicAnnouncements } from "../api/announcementApi";
import "./AnnouncementBar.css";

const REFRESH_INTERVAL = 30000;

const AnnouncementGroup = ({ announcements, hidden = false }) => (
  <div className="announcement-group" aria-hidden={hidden}>
    {announcements.map((announcement) => (
      <div className="announcement-item" key={announcement.id}>
        <span>{announcement.content}</span>
        <span className="announcement-separator" aria-hidden="true">
          ✦
        </span>
      </div>
    ))}
  </div>
);

const AnnouncementBar = () => {
  const [announcements, setAnnouncements] = useState([]);

  const loadAnnouncements = useCallback(async () => {
    try {
      const data = await getPublicAnnouncements();
      setAnnouncements(data.filter((item) => item.is_active));
    } catch (error) {
      console.error("Failed to load announcement bar:", error);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();

    const intervalId = window.setInterval(
      loadAnnouncements,
      REFRESH_INTERVAL
    );

    const handleAnnouncementUpdate = () => loadAnnouncements();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadAnnouncements();
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
  }, [loadAnnouncements]);

  const totalCharacters = useMemo(
    () => announcements.reduce(
      (total, item) => total + item.content.length,
      0
    ),
    [announcements]
  );

  if (announcements.length === 0) {
    return null;
  }

  const animationDuration = Math.max(18, totalCharacters * 0.16);

  return (
    <section
      className="announcement-bar"
      aria-label="Store announcements"
      style={{ "--announcement-duration": `${animationDuration}s` }}
    >
      <div className="announcement-track">
        <AnnouncementGroup announcements={announcements} />
        <AnnouncementGroup announcements={announcements} hidden />
      </div>
    </section>
  );
};

export default AnnouncementBar;
