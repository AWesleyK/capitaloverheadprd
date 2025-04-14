import { useEffect, useState } from "react";
import styles from "./AnnouncementControl.module.scss";

export default function AnnouncementControl() {
  const [form, setForm] = useState({
    message: "",
    backgroundColor: "#f59e0b",
    textColor: "#ffffff", // new field
    enabled: false,
    expiresAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [originalForm, setOriginalForm] = useState(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch("/api/admin/dashboard/announcement");
        const data = await res.json();

        if (res.ok && data.banner) {
          const loaded = {
            message: data.banner.message,
            backgroundColor: data.banner.backgroundColor || "#f59e0b",
            textColor: data.banner.textColor || "#ffffff", // load existing or default
            enabled: data.banner.enabled,
            expiresAt: data.banner.expiresAt
              ? new Date(data.banner.expiresAt).toISOString().slice(0, 16)
              : "",
          };

          setForm(loaded);
          setOriginalForm(loaded);
        }
      } catch (err) {
        console.error("Failed to fetch banner", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  const isFormChanged = () => {
    if (!originalForm) return true;

    return (
      form.message !== originalForm.message ||
      form.backgroundColor !== originalForm.backgroundColor ||
      form.textColor !== originalForm.textColor ||
      form.enabled !== originalForm.enabled ||
      form.expiresAt !== originalForm.expiresAt
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback("");

    const res = await fetch("/api/admin/announcement", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setFeedback("✅ Banner updated");
    } else {
      setFeedback(data.error || "❌ Error saving banner");
    }

    setSaving(false);
  };

  if (loading) return <p>Loading announcement settings...</p>;

  return (
    <div className={styles.container}>
      <h2>📣 Site-Wide Announcement</h2>

      <label>
        Message:
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={3}
        />
      </label>

      <label>
        Background Color:
        <input
          type="color"
          value={form.backgroundColor}
          onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
        />
      </label>

      <label>
        Text Color:
        <input
          type="color"
          value={form.textColor}
          onChange={(e) => setForm({ ...form, textColor: e.target.value })}
        />
      </label>

      <div
        className={styles.previewBox}
        style={{
          backgroundColor: form.backgroundColor,
          color: form.textColor,
          padding: "1rem",
          borderRadius: "6px",
          marginTop: "1rem",
          fontWeight: "bold",
        }}
      >
        {form.message || "Live Preview"}
      </div>

      <label>
        Expires At:
        <input
          type="datetime-local"
          value={form.expiresAt}
          onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
        />
        Enable banner
      </label>

      <button onClick={handleSave} disabled={saving || !isFormChanged()}>
        {saving ? "Saving..." : "Save Banner"}
      </button>

      {feedback && <p className={styles.feedback}>{feedback}</p>}
    </div>
  );
}
