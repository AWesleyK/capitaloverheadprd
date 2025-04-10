//component/Admin/Widgets/QuickNotes/QuickNotes.js

import { useState, useEffect } from "react";
import styles from "./QuickNotes.module.scss";

export default function QuickNotes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [message, setMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch("/api/admin/dashboard/quicknotes/get");
        const data = await res.json();
        setNotes(data);
      } catch (err) {
        console.error("Failed to load notes:", err);
      }
    };
    fetchNotes();
  }, []);

  const handleSave = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await fetch("/api/admin/dashboard/quicknotes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      });
      const savedNote = await res.json();
      setNotes([savedNote, ...notes]);
      setNewNote("");
      setMessage("Note added");
      setTimeout(() => setMessage(""), 1500);
    } catch (err) {
      console.error("Failed to save note:", err);
      setMessage("Save failed");
    }
  };

  const toggleCompleted = async (id) => {
    try {
      const res = await fetch("/api/admin/dashboard/quicknotes/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const updated = await res.json();
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note._id === updated._id ? { ...note, ...updated } : note
        )
      );
    } catch (err) {
      console.error("Failed to update note:", err);
    }
  };

  const deleteNote = async (id) => {
    try {
      const res = await fetch("/api/admin/dashboard/quicknotes/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.success) {
        setNotes(result.notes);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };  
  
  const clearCompleted = async () => {
    try {
      const res = await fetch("/api/admin/dashboard/quicknotes/clear-completed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      if (result.success) {
        setNotes(result.notes);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error("Failed to clear completed notes:", err);
    }
  };
  

  const filteredNotes = notes.filter((n) => n.completed === showCompleted);
  const currentNote = filteredNotes[currentIndex] || null;

  const nextNote = () => {
    if (filteredNotes.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredNotes.length);
    }
  };

  const prevNote = () => {
    if (filteredNotes.length > 0) {
      setCurrentIndex((prev) =>
        (prev - 1 + filteredNotes.length) % filteredNotes.length
      );
    }
  };

  return (
    <div className={styles.quickNotes}>
      <h2 className={styles.title}>Quick Notes</h2>

      <textarea
        className={styles.textarea}
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        rows={3}
        placeholder="Type a new note..."
      />
      <button className={styles.saveButton} onClick={handleSave}>
        Add Note
      </button>
      <button
        className={styles.toggleButton}
        onClick={() => {
          setShowCompleted(!showCompleted);
          setCurrentIndex(0);
        }}
      >
        {showCompleted ? "Show Active" : "Show Completed"}
      </button>
      {message && <div className={styles.message}>{message}</div>}

      {currentNote ? (
        <div className={styles.noteCard}>
          <div className={styles.noteTop}>
            <span className={styles.noteDate}>
              {new Date(currentNote.createdAt).toLocaleDateString()}
            </span>
            <div className={styles.actions}>
              <button
                className={styles.checkButton}
                onClick={() => toggleCompleted(currentNote._id)}
              >
                {currentNote.completed ? "↩" : "✓"}
              </button>
              {showCompleted && (
                <button
                  className={styles.deleteButton}
                  onClick={() => deleteNote(currentNote._id)}
                >
                  🗑
                </button>
              )}
            </div>
          </div>
          <p
            className={styles.noteContent}
            style={{ fontFamily: "cursive", padding: "1rem", margin: "0.5rem 0" }}
          >
            {currentNote.content}
          </p>
        </div>
      ) : (
        <p>No notes to show.</p>
      )}

      {filteredNotes.length > 1 && (
        <div className={styles.navigation}>
          <button onClick={prevNote}>&larr;</button>
          <span>
            {currentIndex + 1} / {filteredNotes.length}
          </span>
          <button onClick={nextNote}>&rarr;</button>
        </div>
      )}

      {showCompleted && filteredNotes.length > 0 && (
        <button className={styles.clearButton} onClick={clearCompleted}>
          Clear All Completed Notes
        </button>
      )}
    </div>
  );
}
