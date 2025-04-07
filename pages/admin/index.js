import AdminLayout from "../../components/AdminLayout/AdminLayout";
import Link from "next/link";

export default function AdminHome() {
  return (
    <AdminLayout>
      <h1>Welcome to the Admin Dashboard</h1>
      <p>Select a section to manage:</p>
      <ul>
        <li><Link href="/admin/catalog">🛒 Manage Catalog</Link></li>
        <li><Link href="/admin/services">🛠️ Manage Services</Link></li>
        <li><Link href="/admin/settings">🎨 Settings</Link></li>
        <li><Link href="/admin/payments">💸 Send Payments</Link></li>
      </ul>
    </AdminLayout>
  );
}
