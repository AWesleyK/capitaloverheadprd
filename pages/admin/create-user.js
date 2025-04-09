import { useState } from "react";
import styles from "./styles/CreateUser.module.scss";
import { requireAuth } from "../api/auth/requireAuth";

export const getServerSideProps = (ctx) => requireAuth(ctx, ["Owner"]);

export default function CreateUser() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const handleCreate = async () => {
    setMessage("");

    const res = await fetch("/api/dev/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(`✅ User '${username}' created!`);
      setUsername("");
    } else {
      setMessage(`❌ ${data.error || "Failed to create user"}`);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Create User</h1>
      <input
        type="text"
        placeholder="Enter a username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles.input}
      />
      <button onClick={handleCreate} className={styles.button}>
        Create User
      </button>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
