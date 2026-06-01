import { useEffect, useState } from "react";
import styles from "./styles/AdminPage.module.scss";
import { requireAuth } from "../api/auth/requireAuth";

export const getServerSideProps = (ctx) =>
  requireAuth(ctx, { roles: ["Admin"], minTier: 1 });

const EMPTY_ADD = { cityName: "", state: "OK", metaTitle: "", metaDescription: "", intro: "" };

export default function CitiesPage() {
  const [hubs, setHubs] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [expanded, setExpanded] = useState(() => new Set());
  const [savingSlug, setSavingSlug] = useState(null);
  const [savedSlug, setSavedSlug] = useState(null);
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD);
  const [adding, setAdding] = useState(false);

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

  const toggle = (slug) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });

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
      setHubs((prev) => prev.map((h) => (h.citySlug === hub.citySlug ? { ...h, hasOverride: true } : h)));
      setTimeout(() => setSavedSlug((s) => (s === hub.citySlug ? null : s)), 2500);
    } else {
      alert("Save failed.");
    }
  };

  const addCity = async () => {
    if (!addForm.cityName.trim()) return alert("Enter a city name.");
    setAdding(true);
    const res = await fetch("/api/admin/cities/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    setAdding(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setAddForm(EMPTY_ADD);
      setShowAdd(false);
      await load();
      if (data.citySlug) setExpanded((prev) => new Set(prev).add(data.citySlug));
    } else {
      alert(data.error || "Could not add city.");
    }
  };

  const deleteCity = async (hub) => {
    if (!confirm(`Remove ${hub.cityName}, ${hub.state}? It will be taken off the site on the next rebuild.`)) return;
    const res = await fetch("/api/admin/cities/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ citySlug: hub.citySlug }),
    });
    if (res.ok) {
      setHubs((prev) => prev.filter((h) => h.citySlug !== hub.citySlug));
    } else {
      alert("Delete failed.");
    }
  };

  const filtered = hubs.filter((h) =>
    (h.cityName || "").toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className={styles.page}>
      <h1>City Content</h1>
      <p style={{ maxWidth: 720, color: "#555" }}>
        Edit, add, or remove city service-area pages. Changes are stored as
        overrides and go live on the next <strong>Rebuild Site</strong>. Leaving
        a field blank keeps the original base content.
      </p>

      {/* Add city */}
      <div style={{ marginBottom: "1.5rem" }}>
        {!showAdd ? (
          <button className={styles.button} onClick={() => setShowAdd(true)}>+ Add City</button>
        ) : (
          <div style={{ border: "1px solid #bf0a30", borderRadius: 8, padding: "1.25rem 1.5rem" }}>
            <h3 style={{ marginTop: 0 }}>Add a City</h3>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <div className={styles.formGroup} style={{ flex: "2 1 220px" }}>
                <label>City Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Moore"
                  value={addForm.cityName}
                  onChange={(e) => setAddForm({ ...addForm, cityName: e.target.value })}
                />
              </div>
              <div className={styles.formGroup} style={{ flex: "0 1 90px" }}>
                <label>State:</label>
                <input
                  type="text"
                  value={addForm.state}
                  onChange={(e) => setAddForm({ ...addForm, state: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>SEO Title (optional):</label>
              <input
                type="text"
                value={addForm.metaTitle}
                onChange={(e) => setAddForm({ ...addForm, metaTitle: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Meta Description (optional):</label>
              <textarea
                rows={2}
                value={addForm.metaDescription}
                onChange={(e) => setAddForm({ ...addForm, metaDescription: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Intro paragraph (optional):</label>
              <textarea
                rows={4}
                value={addForm.intro}
                onChange={(e) => setAddForm({ ...addForm, intro: e.target.value })}
              />
            </div>
            <button className={styles.button} onClick={addCity} disabled={adding}>
              {adding ? "Adding…" : "Add City"}
            </button>
            <button
              className={styles.button}
              style={{ background: "#6b7280", marginLeft: "0.5rem" }}
              onClick={() => { setShowAdd(false); setAddForm(EMPTY_ADD); }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

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
        filtered.map((hub) => {
          const isOpen = expanded.has(hub.citySlug);
          return (
            <div
              key={hub.citySlug}
              style={{ border: "1px solid #e2e2e2", borderRadius: 8, marginBottom: "0.75rem", overflow: "hidden" }}
            >
              {/* Collapsed header row */}
              <div
                onClick={() => toggle(hub.citySlug)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  padding: "0.85rem 1.25rem",
                  cursor: "pointer",
                  background: isOpen ? "#faf0f0" : "#fafafa",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontWeight: 600 }}>
                  <span style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.15s", display: "inline-block" }}>▶</span>
                  {hub.cityName}, {hub.state}
                  {hub.isAdded && <span style={{ fontSize: "0.65rem", color: "#2f855a", fontWeight: 700 }}>NEW</span>}
                  {hub.hasOverride && !hub.isAdded && <span style={{ fontSize: "0.65rem", color: "#bf0a30", fontWeight: 700 }}>EDITED</span>}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteCity(hub); }}
                  className={styles.button}
                  style={{ background: "#c53030", padding: "0.3rem 0.7rem", fontSize: "0.8rem" }}
                >
                  Delete
                </button>
              </div>

              {/* Expanded editor */}
              {isOpen && (
                <div style={{ padding: "1rem 1.25rem 1.25rem" }}>
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
                  <button onClick={() => save(hub)} className={styles.button} disabled={savingSlug === hub.citySlug}>
                    {savingSlug === hub.citySlug ? "Saving…" : "Save"}
                  </button>
                  {savedSlug === hub.citySlug && (
                    <span style={{ marginLeft: "0.75rem", color: "#2f855a", fontWeight: 600 }}>
                      ✓ Saved — rebuild to publish
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
