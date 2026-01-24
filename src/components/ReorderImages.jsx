import { Reorder } from "motion/react";
import { useEffect, useState } from "react";

const ReorderImages = ({
  images = [],
  onChange,
  onDelete, // 🗑️ delete handler من الأب
}) => {
  const [items, setItems] = useState([]);

  /* ================= SYNC WITH PARENT ================= */
  useEffect(() => {
    setItems(images);
  }, [images]);

  /* ================= SET COVER ================= */
  const handleSetCover = (id) => {
    const updated = items.map((img) => ({
      ...img,
      is_cover: img.id === id,
    }));

    setItems(updated);
    onChange(updated);
  };

  /* ================= DELETE IMAGE ================= */
  const handleDelete = (img) => {
    // حماية: مينفعش تمسحي الكافر
    if (img.is_cover) {
      alert("مينفعش تمسحي صورة الكافر ❌");
      return;
    }

    if (!window.confirm("مسح الصورة؟")) return;

    // ننده الأب يمسح من السيرفر
    onDelete(img.id);
  };

  return (
    <Reorder.Group
      axis="x"
      values={items}
      onReorder={(newOrder) => {
        setItems(newOrder);
        onChange(newOrder);
      }}
      className="reorder-images"
    >
      {items.map((img, index) => (
        <Reorder.Item
          key={`image-${img.id ?? index}`}
          value={img}
          className="reorder-image-item"
        >
          {/* 👑 COVER BADGE */}
          {img.is_cover && (
            <div className="cover-badge">Cover</div>
          )}

          {/* 🗑️ DELETE */}
          {!img.is_cover && (
            <button
              type="button"
              className="image-delete-btn"
              onClick={() => handleDelete(img)}
            >
              ×
            </button>
          )}

          {/* IMAGE */}
          <img
            src={img.image_url}
            alt=""
            draggable={false}
          />

          {/* SET AS COVER */}
          {!img.is_cover && (
            <button
              type="button"
              className="set-cover-btn"
              onClick={() => handleSetCover(img.id)}
            >
              Set as cover
            </button>
          )}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};

export default ReorderImages;
