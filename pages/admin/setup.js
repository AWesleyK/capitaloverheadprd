import { useState } from "react";
import { useRouter } from "next/router";
import styles from "./styles/Setup.module.scss";

export default function Setup() {
  const router = useRouter();
  const { userId } = router.query;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSetup = async () => {
    setError("");
    setSuccess("");

    if (!password || !confirm) {
      return setError("Please fill out both fields.");
    }

    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    const res = await fetch("/api/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setSuccess("Password set! You can now log in.");
      setTimeout(() => router.push("/admin/login"), 2000);
    } else {
      setError(data.error || "Something went wrong.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Set Your Password</h1>

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className={styles.input}
      />

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <button onClick={handleSetup} className={styles.button}>
        Set Password
      </button>
    </div>
  );
}
