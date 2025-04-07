import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./AdminLayout.module.scss";

const navItems = [
  { label: "Catalog", path: "/admin/catalog" },
  { label: "Services", path: "/admin/services" },
  { label: "Settings", path: "/admin/settings" },
  { label: "Payments", path: "/admin/payments" },
];

export default function AdminLayout({ children }) {
  const { pathname } = useRouter();

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2>Admin Panel</h2>
        {navItems.map(({ label, path }) => (
          <Link key={path} href={path} passHref>
            <div className={`${styles.link} ${pathname === path ? styles.active : ""}`}>
              {label}
            </div>
          </Link>
        ))}
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
