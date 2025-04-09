import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useEffect, useState } from "react";
import styles from "./AdminLayout.module.scss";

const navItems = [
  { label: "Catalog", path: "/admin/catalog", minTier: 1 },
  { label: "Services", path: "/admin/services", minTier: 1 },
  { label: "Settings", path: "/admin/settings", minTier: 2 },
  { label: "Payments", path: "/admin/payments", minTier: 1 },
];

export default function AdminLayout({ children }) {
  const { pathname, push } = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef();
  const toggleButtonRef = useRef();

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

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  // ✅ Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);
  

  return (
    <div className={styles.container}>
<button
  ref={toggleButtonRef}
  className={`${styles.menuToggle} ${menuOpen ? styles.openToggle : ""}`}
  onClick={() => setMenuOpen(!menuOpen)}
>
  <span className={styles.bar}></span>
  <span className={styles.bar}></span>
  <span className={styles.bar}></span>
</button>


      <aside
        ref={sidebarRef}
        className={`${styles.sidebar} ${menuOpen ? styles.open : ""}`}
      >
        <h2>Admin Panel</h2>

        <Link href="/admin" passHref>
          <div
            className={`${styles.link} ${pathname === "/admin" ? styles.active : ""}`}
            onClick={handleNavClick}
          >
            Dashboard
          </div>
        </Link>

        {navItems
          .filter(({ minTier }) => !user || (user.tier ?? 0) >= minTier)
          .map(({ label, path }) => (
            <Link key={path} href={path} passHref>
              <div
                className={`${styles.link} ${pathname === path ? styles.active : ""}`}
                onClick={handleNavClick}
              >
                {label}
              </div>
            </Link>
          ))}

        {user?.roles?.includes("Owner") && (
          <>
            <hr className={styles.divider} />
            <h3 className={styles.subheading}>Owner Tools</h3>

            <Link href="/admin/users" passHref>
              <div
                className={`${styles.link} ${pathname === "/admin/users" ? styles.active : ""}`}
                onClick={handleNavClick}
              >
                Manage Users
              </div>
            </Link>

            <Link href="/admin/create-user" passHref>
              <div
                className={`${styles.link} ${pathname === "/admin/create-user" ? styles.active : ""}`}
                onClick={handleNavClick}
              >
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
