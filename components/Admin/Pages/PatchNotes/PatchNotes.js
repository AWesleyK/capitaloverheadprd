import { useEffect, useState } from "react";
import styles from "./PatchNotes.module.scss";

export default function PatchNotes({ user }) {
  const [patches, setPatches] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [newNotes, setNewNotes] = useState("");
  const [newVersion, setNewVersion] = useState("");
  const [message, setMessage] = useState("");

  const isOverlord = user?.roles?.includes("Overlord");

  useEffect(() => {
    fetch("/api/admin/patch-notes")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPatches(data);
          if (data.length) setSelectedVersion(data[0].version);
        } else {
          console.error("Unexpected patch notes response:", data);
          setPatches([]);
        }
      })
      .catch(err => {
        console.error("Failed to load patch notes:", err);
        setPatches([]);
      });
  }, []);
  

  const handleSubmit = async () => {
    if (!newNotes || !newVersion) return alert("Fill both fields");
    const res = await fetch("/api/admin/patch-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: newNotes, version: newVersion })
    });

    if (res.ok) {
      setNewNotes("");
      setNewVersion("");
      const updated = await fetch("/api/admin/patch-notes").then(res => res.json());
      setPatches(updated);
      setSelectedVersion(updated[0].version);
      setMessage("Patch note added!");
    } else {
      setMessage("Failed to save patch notes");
    }
  };

  const selectedPatch = patches.find(p => p.version === selectedVersion);

  return (
    <div className={styles.patchNotes}>
      <h2>Patch Notes</h2>
  
      {isOverlord ? (
        <>
          <div className={styles.editor}>
            <input
              type="text"
              placeholder="Version (e.g., 1.2.3)"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
            />
            <textarea
              placeholder="Enter patch notes..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={6}
            />
            <button onClick={handleSubmit}>Submit Patch Notes</button>
            {message && <p className={styles.message}>{message}</p>}
          </div>
  
          <hr className={styles.divider} />
  
          <h3 className={styles.previewTitle}>Client View Preview</h3>
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className={styles.versionSelect}
          >
            {patches.map(p => (
              <option key={p.version} value={p.version}>
                v{p.version}
              </option>
            ))}
          </select>
          {selectedPatch ? (
            <div className={styles.notesDisplay}>
              <pre>{selectedPatch.notes}</pre>
            </div>
          ) : (
            <p>No patch notes available.</p>
          )}
        </>
      ) : (
        <>
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className={styles.versionSelect}
          >
            {patches.map(p => (
              <option key={p.version} value={p.version}>
                v{p.version}
              </option>
            ))}
          </select>
          {selectedPatch ? (
            <div className={styles.notesDisplay}>
              <pre>{selectedPatch.notes}</pre>
            </div>
          ) : (
            <p>No patch notes available.</p>
          )}
        </>
      )}
    </div>
  );  
}
