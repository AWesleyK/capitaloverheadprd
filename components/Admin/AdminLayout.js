import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useEffect, useState } from "react";
import styles from "./AdminLayout.module.scss";

const navItems = [
  { label: "Catalog", path: "/admin/catalog", minTier: 1, requireAdmin: true },
  { label: "Services", path: "/admin/services", minTier: 1, requireAdmin: true },
  { label: "Settings", path: "/admin/settings", minTier: 2, requireAdmin: true },
  { label: "Blogs", path: "/admin/blogs", minTier: 1, requireAdmin: false },
];

export default function AdminLayout({ children }) {
  const { pathname, push } = useRouter();
  const [user, setUser] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebarRef = useRef();
  const toggleButtonRef = useRef();

  useEffect(() => {
    const getUserAndStatus = async () => {
      try {
        const [userRes, subRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/admin/payments/settings"),
        ]);

        const userData = await userRes.json();
        console.log("Auth /me response:", userData);
        const subData = await subRes.json();

        setUser(userData.user || null);
        setSubscriptionStatus(subData.subscriptionStatus || null);
      } catch {
        setUser(null);
        setSubscriptionStatus(null);
      }
    };

    getUserAndStatus();
  }, []);

  const hasValidSubscription = ["active", "trialing", "past_due"].includes(subscriptionStatus);

  const handleLogout = async () => {
    await fetch("/api/auth/logout");
    push("/admin/login");
  };

  const handleNavClick = () => {
    setMenuOpen(false);
  };

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

  // Fallback while data is loading
  if (user === null || subscriptionStatus === null) {
    return (
      <div className={styles.container}>
        <p style={{ padding: "2rem" }}>Loading admin tools...</p>
      </div>
    );
  }

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

      <aside ref={sidebarRef} className={`${styles.sidebar} ${menuOpen ? styles.open : ""}`}>
        <h2>Admin Panel</h2>

        <Link href="/admin" passHref>
          <div
            className={`${styles.link} ${pathname === "/admin" ? styles.active : ""}`}
            onClick={handleNavClick}
          >
            Dashboard
          </div>
        </Link>

        {hasValidSubscription &&
          navItems
            .filter(({ minTier, requireAdmin }) =>
              (!user || (user.tier ?? 0) >= minTier) &&
              (!requireAdmin || user?.roles?.some(role => role.includes("Admin")))
            )
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

            {hasValidSubscription && (
              <>
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

            <Link href="/admin/payments" passHref>
              <div
                className={`${styles.link} ${pathname === "/admin/payments" ? styles.active : ""}`}
                onClick={handleNavClick}
              >
                Payments
              </div>
          </Link>
          </>
        )}
{user && (
  <div className={styles.userDisplay}>
    <p className={styles.userLabel}>Logged in as:</p>
    <p className={styles.userName}>
      {user.fName || ""} {user.lName || ""} <br />
      <span className={styles.username}>@{user.username}</span>
      <span className={styles.userRole}>
        {" "}
        ({user.roles?.[user.roles.length - 1] || "User"})
      </span>
    </p>
  </div>
)}


<button className={styles.logoutButton} onClick={handleLogout}>
  Logout
</button>

      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
