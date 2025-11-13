import { useEffect, useState } from "react";
import styles from "./SiteSettingsControl.module.scss";

export default function SiteSettingsControl({ disabled = false }) {
  const [form, setForm] = useState({
    email: "",
    phone: "",
    phoneDisplay: "",
    addressLine1: "",
    addressLine2: "",
  });
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/content/site-settings/get");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setForm({
              email: data.email || "",
              phone: data.phone || "",
              phoneDisplay: data.phoneDisplay || "",
              addressLine1: data.addressLine1 || "",
              addressLine2: data.addressLine2 || "",
            });
          }
        } else {
          console.error("Failed to fetch site settings");
        }
      } catch (err) {
        console.error("Error fetching site settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSaveMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/content/site-settings/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSaveMessage("Site settings saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        setErrorMessage("Failed to save settings.");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      setErrorMessage("Failed to save settings.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className={styles.control}>
        <h2>Site Settings</h2>
        <p>Loading site settings...</p>
      </div>
    );
  }

  return (
    <div className={`${styles.control} ${disabled ? styles.disabled : ""}`}>
      <h2>Site Settings</h2>

      <div className={styles.field}>
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label>Phone (raw digits)</label>
          <input
            type="text"
            placeholder="4054560399"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label>Address Line 1</label>
        <input
          type="text"
          placeholder="307 Main Street"
          value={form.addressLine1}
          onChange={(e) => handleChange("addressLine1", e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className={styles.field}>
        <label>Address Line 2</label>
        <input
          type="text"
          placeholder="Elmore City, OK 73433"
          value={form.addressLine2}
          onChange={(e) => handleChange("addressLine2", e.target.value)}
          disabled={disabled}
        />
      </div>

      <button
        onClick={handleSubmit}
        className={styles.saveButton}
        disabled={disabled}
      >
        Save Settings
      </button>

      {saveMessage && (
        <div className={styles.saveMessage}>{saveMessage}</div>
      )}
      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
    </div>
  );
}
