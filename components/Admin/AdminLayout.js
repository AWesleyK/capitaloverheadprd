import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./AdminLayout.module.scss";

const navItems = [
  { label: "Catalog", path: "/admin/catalog" },
  { label: "Services", path: "/admin/services" },
  { label: "Settings", path: "/admin/settings" },
  { label: "Payments", path: "/admin/payments" },
];

export default function AdminLayout({ children }) {
  const { pathname, push } = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        setUser(null);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout");
    push("/admin/login");
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2>Admin Panel</h2>

        <Link href="/admin" passHref>
          <div className={`${styles.link} ${pathname === "/admin" ? styles.active : ""}`}>
            Dashboard
          </div>
        </Link>

        {navItems.map(({ label, path }) => (
          <Link key={path} href={path} passHref>
            <div className={`${styles.link} ${pathname === path ? styles.active : ""}`}>
              {label}
            </div>
          </Link>
        ))}

        {user?.roles?.includes("Owner") && (
          <>
            <hr className={styles.divider} />
            <h3 className={styles.subheading}>Owner Tools</h3>

            <Link href="/admin/users" passHref>
              <div className={`${styles.link} ${pathname === "/admin/users" ? styles.active : ""}`}>
                Manage Users
              </div>
            </Link>

            <Link href="/admin/create-user" passHref>
              <div className={`${styles.link} ${pathname === "/admin/create-user" ? styles.active : ""}`}>
                Create Account
              </div>
            </Link>
          </>
        )}

        <button className={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
