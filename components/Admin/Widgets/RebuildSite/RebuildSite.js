// components/Admin/Widgets/RebuildSite/RebuildSite.js

import { useState, useEffect } from "react";
import styles from "./RebuildSite.module.scss";

const DISABLE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export default function RebuildSite({ disabled }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [lastTriggered, setLastTriggered] = useState(null);
  const [internalDisabled, setInternalDisabled] = useState(false);

  useEffect(() => {
    const storedTimestamp = localStorage.getItem("lastRebuild");
    if (storedTimestamp) {
      const last = new Date(parseInt(storedTimestamp));
      setLastTriggered(last);

      const timeDiff = Date.now() - last.getTime();
      if (timeDiff < DISABLE_DURATION_MS) {
        setInternalDisabled(true);
        setTimeout(() => setInternalDisabled(false), DISABLE_DURATION_MS - timeDiff);
      }
    }
  }, []);

  const triggerDeploy = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/rebuild-site", {
        method: "POST",
      });

      if (res.ok) {
        const now = Date.now();
        localStorage.setItem("lastRebuild", now);
        setLastTriggered(new Date(now));
        setInternalDisabled(true);
        setTimeout(() => setInternalDisabled(false), DISABLE_DURATION_MS);
        setMessage("✅ Site rebuild triggered successfully.");
      } else {
        setMessage("❌ Failed to trigger rebuild.");
      }
    } catch (err) {
      console.error("Deploy error:", err);
      setMessage("❌ Error triggering rebuild.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.rebuildWidget} ${disabled ? styles.disabled : ""}`}>
      <h2 className={styles.title}>Rebuild Website</h2>
      <p className={styles.description}>Trigger a redeploy of the live site via Vercel.</p>
      <button
        className={styles.button}
        onClick={triggerDeploy}
        disabled={loading || internalDisabled || disabled}
      >
        {loading ? "Rebuilding..." : internalDisabled || disabled ? "Try Again Later" : "Rebuild Site"}
      </button>
      {message && <p className={styles.message}>{message}</p>}
      {lastTriggered && (
        <p className={styles.timestamp}>
          Last triggered: {lastTriggered.toLocaleString()}
        </p>
      )}
    </div>
  );
}
