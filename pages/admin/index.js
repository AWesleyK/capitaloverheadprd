
import Link from "next/link";
import { requireAuth } from "../api/auth/requireAuth";
import AnnouncementControl from "../../components/Admin/AnnouncementControl/AnnouncementControl";

export const getServerSideProps = (ctx) => requireAuth(ctx, ["Admin"]);

export default function AdminHome() {
  return (
    <div>
      <h1>Welcome to the Admin Dashboard</h1>
      <p>Select a section to manage:</p>
      <ul>
        <li><Link href="/admin/catalog">🛒 Manage Catalog</Link></li>
        <li><Link href="/admin/services">🛠️ Manage Services</Link></li>
        <li><Link href="/admin/settings">🎨 Settings</Link></li>
        <li><Link href="/admin/payments">💸 Send Payments</Link></li>
        <AnnouncementControl />
      </ul>
      </div>
  );
}
