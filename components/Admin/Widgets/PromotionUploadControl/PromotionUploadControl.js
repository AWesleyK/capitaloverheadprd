import { useEffect, useState } from "react";
import styles from "./PromotionUploadControl.module.scss";

export default function PromotionUploadControl() {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/dashboard/promotions/get")
      .then(res => res.json())
      .then(data => setImages(data.map(i => ({ id: i._id, url: i.url }))))
      .catch(() => setMessage("Failed to load images"));
  }, []);

  const handleUpload = async () => {
    if (!selected) return alert("Select an image");

    const img = new Image();
    img.onload = async () => {
      if (img.width <= img.height) {
        setMessage("Please upload a rectangular (wide) image.");
        return;
      }

      const formData = new FormData();
      formData.append("file", selected);
      formData.append("folder", "promotions");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      const dbRes = await fetch("/api/admin/dashboard/promotions/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data.url }),
      });

      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setImages((prev) => [...prev, { id: dbData.id, url: data.url }]);
        setMessage("Image uploaded successfully");
      } else {
        setMessage("Upload succeeded but saving failed");
      }
    };
    img.src = URL.createObjectURL(selected);
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/admin/dashboard/promotions/delete?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== id));
      setMessage("Deleted image.");
    } else {
      setMessage("Failed to delete.");
    }
  };

  return (
    <div className={styles.control}>
      <h2>Dino Deals Manager</h2>
      <input type="file" onChange={(e) => setSelected(e.target.files?.[0])} />
      <button onClick={handleUpload}>Upload</button>
      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.previewList}>
        {images.map(({ id, url }) => (
          <div key={id} className={styles.previewItem}>
            <img src={url} className={styles.preview} alt="Promo" />
            <button onClick={() => handleDelete(id)} className={styles.deleteBtn}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
