//FOR LOCAL HOST UNCOMMENT THE BELOW BLOCK/////////////////////////////////////////////

import { useState } from "react";
import { useRouter } from "next/router";
import styles from "./styles/Login.module.scss";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    
console.log("LOGIN RESPONSE:", data);

    if (res.ok) {
      if (data.setupRequired) {
        router.push(`/admin/setup?userId=${data.userId}`);
      } else {
        router.push("/admin/");
      }
    } else {
      setError(data.error || "Login failed");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Login</h1>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles.input}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
      />

      {error && <p className={styles.error}>{error}</p>}

      <button onClick={handleLogin} className={styles.button}>
        Log In
      </button>
    </div>
  );
}



//FOR TESTING IN DEV ENV UNCOMMENT BELOW BLOCK\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

/*
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "./styles/Login.module.scss";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  const handleLogin = async () => {
    setError("");
  
    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : "";
  
    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        if (data.setupRequired) {
          router.push(`/admin/setup?userId=${data.userId}`);
        } else {
          router.push("/admin/");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred.");
    }
  };
  

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Login</h1>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles.input}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
      />

      {error && <p className={styles.error}>{error}</p>}

      <button onClick={handleLogin} className={styles.button}>
        Log In
      </button>
    </div>
  );
}

*/