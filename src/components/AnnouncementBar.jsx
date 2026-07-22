import "./AnnouncementBar.css";

const ANNOUNCEMENTS = [
  "Free Shipping on orders over 900 EGP",
  "New pieces added regularly",
  "Every order is carefully wrapped with love",
];

const AnnouncementGroup = () => (
  <div className="announcement-group" aria-hidden="true">
    {ANNOUNCEMENTS.map((message, index) => (
      <div className="announcement-item" key={`${message}-${index}`}>
        <span>{message}</span>
        <span className="announcement-separator">✦</span>
      </div>
    ))}
  </div>
);

const AnnouncementBar = () => {
  return (
    <section
      className="announcement-bar"
      aria-label="Store announcements"
    >
      <div className="announcement-track">
        <AnnouncementGroup />
        <AnnouncementGroup />
      </div>
    </section>
  );
};

export default AnnouncementBar;
