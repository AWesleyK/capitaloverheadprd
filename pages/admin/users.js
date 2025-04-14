import { useEffect, useState } from "react";
import styles from "./styles/Users.module.scss";
import { requireAuth } from "../api/auth/requireAuth";

export const getServerSideProps = (ctx) =>
  requireAuth(ctx, { roles: ["Owner"], minTier: 1 });

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users/list");
    const data = await res.json();
    if (res.ok) {
      setUsers(data.users);
    } else {
      setError(data.error || "Failed to load users.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUnlock = async (id) => {
    await fetch(`/api/admin/users/unlock?id=${id}`, { method: "PUT" });
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await fetch(`/api/admin/users/delete?id=${id}`, { method: "DELETE" });
    fetchUsers();
  };

  const handleResetPassword = async (id, newPassword) => {
    const res = await fetch("/api/admin/users/reset-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, newPassword }),
    });
    if (res.ok) {
      alert("Password reset. User will be prompted to set a new one.");
      fetchUsers();
    } else {
      const data = await res.json();
      alert(data.error || "Reset failed.");
    }
  };
  
  const handleUpdateRoles = async (id, roles) => {
    const res = await fetch("/api/admin/users/update-roles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, roles }),
    });
    if (res.ok) {
      alert("Roles updated.");
      fetchUsers();
    } else {
      const data = await res.json();
      alert(data.error || "Update failed.");
    }
  };

  const handleLock = async (id) => {
    const res = await fetch("/api/admin/users/lock", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      fetchUsers();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to lock user.");
    }
  };
  
  

  return (
    <div className={styles.container}>
      <h1>Manage Users</h1>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <table className={styles.table}>
<thead>
  <tr>
    <th>Username</th>
    <th>Roles</th>
    <th>Last Login</th>
    <th>Locked</th>
<th>Locked By</th>
<th>Last Locked</th>
<th>Actions</th>
  </tr>
</thead>
          <tbody>
            {users.map((user) => (
 <tr key={user._id}>
 <td>
   {user.username}
   {user.accountLocked && <span className={styles.badge}>Locked</span>}
 </td>
 <td>{user.roles?.join(", ")}</td>
 <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</td>
 <td>{user.accountLocked ? "Yes" : "No"}</td>
 <td>{user.lockedBy || "-"}</td>
 <td>{user.lockedAt ? new Date(user.lockedAt).toLocaleString() : "Never"}</td>
 <td className={styles.actions}>
   {!user.accountLocked && (
     <button onClick={() => handleLock(user._id)}>Lock</button>
   )}
   {user.accountLocked && (
     <button onClick={() => handleUnlock(user._id)}>Unlock</button>
   )}
   <button
     onClick={() => {
       const roles = prompt("Enter new roles (comma-separated):", user.roles.join(", "));
       if (roles !== null) handleUpdateRoles(user._id, roles.split(",").map(r => r.trim()));
     }}
   >
     Update Roles
   </button>
   <button
     onClick={() => {
       const pw = prompt("Enter temporary password:");
       if (pw) handleResetPassword(user._id, pw);
     }}
   >
     Reset PW
   </button>
   <button onClick={() => handleDelete(user._id)}>Delete</button>
 </td>
</tr>

            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
