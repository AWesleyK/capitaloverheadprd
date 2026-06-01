import { useEffect, useState } from "react";
import styles from "./styles/AdminPage.module.scss";
import { requireAuth } from "../api/auth/requireAuth";

export const getServerSideProps = (ctx) =>
  requireAuth(ctx, { roles: ["Admin"], minTier: 1 });

export default function CitiesPage() {
  const [hubs, setHubs] = useState([]);
  const [drafts, setDrafts] = useState({}); // citySlug -> { metaTitle, metaDescription, intro }
  const [savingSlug, setSavingSlug] = useState(null);
  const [savedSlug, setSavedSlug] = useState(null);
  const [query, setQuery] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/cities/list");
    const data = await res.json();
    if (Array.isArray(data)) {
      setHubs(data);
      const seeded = {};
      data.forEach((h) => {
        seeded[h.citySlug] = {
          metaTitle: h.metaTitle || "",
          metaDescription: h.metaDescription || "",
          intro: h.intro || "",
        };
      });
      setDrafts(seeded);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setField = (slug, field, value) =>
    setDrafts((prev) => ({ ...prev, [slug]: { ...prev[slug], [field]: value } }));

  const save = async (hub) => {
    setSavingSlug(hub.citySlug);
    setSavedSlug(null);
    const res = await fetch("/api/admin/cities/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ citySlug: hub.citySlug, ...drafts[hub.citySlug] }),
    });
    setSavingSlug(null);
    if (res.ok) {
      setSavedSlug(hub.citySlug);
      setHubs((prev) =>
        prev.map((h) => (h.citySlug === hub.citySlug ? { ...h, hasOverride: true } : h))
      );
      setTimeout(() => setSavedSlug((s) => (s === hub.citySlug ? null : s)), 2500);
    } else {
      alert("Save failed.");
    }
  };

  const filtered = hubs.filter((h) =>
    (h.cityName || "").toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className={styles.page}>
      <h1>City Content</h1>
      <p style={{ maxWidth: 720, color: "#555" }}>
        Edit the SEO title, meta description, and intro shown on each city
        service-area page. Saved edits are stored as overrides and go live on
        the next <strong>Rebuild Site</strong>. The base content stays intact if
        a field is left blank.
      </p>

      <div className={styles.formGroup} style={{ maxWidth: 360 }}>
        <label>Filter cities:</label>
        <input
          type="text"
          placeholder="Search by city name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p>No cities match.</p>
      ) : (
        filtered.map((hub) => (
          <div
            key={hub.citySlug}
            style={{
              border: "1px solid #e2e2e2",
              borderRadius: 8,
              padding: "1.25rem 1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              {hub.cityName}, {hub.state}{" "}
              {hub.hasOverride && (
                <span style={{ fontSize: "0.7rem", color: "#bf0a30", fontWeight: 600 }}>
                  • edited
                </span>
              )}
            </h3>

            <div className={styles.formGroup}>
              <label>SEO Title:</label>
              <input
                type="text"
                value={drafts[hub.citySlug]?.metaTitle || ""}
                onChange={(e) => setField(hub.citySlug, "metaTitle", e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Meta Description:</label>
              <textarea
                rows={2}
                value={drafts[hub.citySlug]?.metaDescription || ""}
                onChange={(e) => setField(hub.citySlug, "metaDescription", e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Intro paragraph:</label>
              <textarea
                rows={5}
                value={drafts[hub.citySlug]?.intro || ""}
                onChange={(e) => setField(hub.citySlug, "intro", e.target.value)}
              />
            </div>

            <button
              onClick={() => save(hub)}
              className={styles.button}
              disabled={savingSlug === hub.citySlug}
            >
              {savingSlug === hub.citySlug ? "Saving…" : "Save"}
            </button>
            {savedSlug === hub.citySlug && (
              <span style={{ marginLeft: "0.75rem", color: "#2f855a", fontWeight: 600 }}>
                ✓ Saved — rebuild to publish
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
}
