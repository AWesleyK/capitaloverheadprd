// /compenents/Admin/BusinessHoursControl/BusinessHoursControl.js

import { useState, useEffect } from "react";
import styles from "./BusinessHoursControl.module.scss";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function BusinessHoursControl() {
  const [category, setCategory] = useState("store");
  const [hours, setHours] = useState({});
  const [sameEveryDay, setSameEveryDay] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    fetch(`/api/content/business-hours/public`)
      .then(res => res.json())
      .then(data => {
        const current = data[category];
        const map = {};
        current.forEach(entry => {
          map[entry.day] = entry.hours;
        });
        setHours(map);
      });
  }, [category]);

  const handleChange = (day, value) => {
    const newHours = { ...hours, [day]: value };

    if (sameEveryDay) {
      days.forEach(d => {
        newHours[d] = value;
      });
    }

    setHours(newHours);
  };

  const handleSubmit = async () => {
    const res = await fetch("/api/content/business-hours/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, hours }),
    });
  
    if (res.ok) {
      setSaveMessage("Hours saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000); // clear after 3s
    } else {
      setSaveMessage("Failed to save hours.");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };  

  return (
    <div className={styles.control}>
      <h2>Business Hours</h2>

      <div className={styles.toggleButtons}>
        <button
          className={category === "store" ? styles.active : ""}
          onClick={() => setCategory("store")}
        >
          Store Hours
        </button>
        <button
          className={category === "operation" ? styles.active : ""}
          onClick={() => setCategory("operation")}
        >
          Operation Hours
        </button>
      </div>

      <label className={styles.sameEveryDay}>
        <input
          type="checkbox"
          checked={sameEveryDay}
          onChange={(e) => setSameEveryDay(e.target.checked)}
        />
        Same every day
      </label>

      <div className={styles.hoursGrid}>
        {days.map((day) => (
          <div key={day} className={styles.dayRow}>
            <label>{day}:</label>
            <input
              type="text"
              value={hours[day] || ""}
              onChange={(e) => handleChange(day, e.target.value)}
              disabled={sameEveryDay && day !== "Monday"}
            />
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} className={styles.saveButton}>
        Save Hours
      </button>
      {saveMessage && <div className={styles.saveMessage}>{saveMessage}</div>}
    </div>
  );
}
