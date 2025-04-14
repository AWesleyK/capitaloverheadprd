import { useState } from "react";
import { useRouter } from "next/router";
import styles from "./styles/Setup.module.scss";

export default function Setup() {
  const router = useRouter();
  const { userId } = router.query;

  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSetup = async () => {
    setError("");
    setSuccess("");

    if (!password || !confirm || !fName || !lName || !email) {
      return setError("Please fill out all required fields.");
    }

    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    const res = await fetch("/api/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        password,
        fName,
        lName,
        email,
        address,
        city,
        state,
        zip,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setSuccess("Account setup complete! Redirecting...");
      setTimeout(() => router.push("/admin/login"), 2000);
    } else {
      setError(data.error || "Something went wrong.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Finish Account Setup</h1>

      <input type="text" placeholder="First Name" value={fName} onChange={(e) => setFName(e.target.value)} className={styles.input} />
      <input type="text" placeholder="Last Name" value={lName} onChange={(e) => setLName(e.target.value)} className={styles.input} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} />
      <input type="text" placeholder="Street Address" value={address} onChange={(e) => setAddress(e.target.value)} className={styles.input} />
      <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className={styles.input} />
      <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className={styles.input} />
      <input type="text" placeholder="ZIP Code" value={zip} onChange={(e) => setZip(e.target.value)} className={styles.input} />

      <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} />
      <input type="password" placeholder="Confirm Password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={styles.input} />

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <button onClick={handleSetup} className={styles.button}>
        Complete Setup
      </button>
    </div>
  );
}
