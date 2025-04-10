// /compenents/Admin/Widgets/SearchLogs/SearchLogs.js
import { useEffect, useState } from "react";
import styles from "./SearchLogs.module.scss";

export default function SearchLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/admin/dashboard/logs/get");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Failed to load search logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className={styles.logWidget}>
      <h2 className={styles.title}>Recent Search Activity</h2>
      {loading ? (
        <p className={styles.loading}>Loading logs...</p>
      ) : logs.length === 0 ? (
        <p className={styles.empty}>No recent searches yet.</p>
      ) : Array.isArray(logs) && logs.length > 0 ? (
        <ul className={styles.logList}>
          {logs.map((log, index) => (
            <li key={index} className={styles.logItem}>
              <div className={styles.logMeta}>
                <span className={styles.page}>{log.page}</span>
                <span className={styles.timestamp}>
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                {/*<span className={styles.ip}>{log.ip}</span>*/}
              </div>
              <div className={styles.query}>
  <strong>Search:</strong>{" "}
  {log.query ??
    log.queryParams?.search ??
    "(unknown)"}
</div>
              {log.filters && Object.keys(log.filters).length > 0 && (
                <div className={styles.filters}>
                  <strong>Filters:</strong>{" "}
                  {Object.entries(log.filters).map(([key, value]) => (
                    <span key={key}>
                      {key}: {value || "Any"}{" "}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No search logs available.</p>
      )}
    </div>
  );  
}