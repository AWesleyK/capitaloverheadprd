import { useEffect, useState } from "react";
import styles from "./styles/Users.module.scss";
import { requireAuth } from "../api/auth/requireAuth";
import { FiArrowLeft } from "react-icons/fi";

export const getServerSideProps = (ctx) =>
  requireAuth(ctx, { roles: ["Owner"], minTier: 1 });

const roleHierarchy = ["User", "Admin", "Owner"];

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");

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

  const handleUpdateRoles = async (id, role) => {
    const rolesToAssign = role === "Owner" ? ["User", "Admin", "Owner"] : role === "Admin" ? ["User", "Admin"] : ["User"];
    const res = await fetch("/api/admin/users/update-roles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, roles: rolesToAssign }),
    });
    if (res.ok) {
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

  const handleSaveDetails = async () => {
    const { _id, fName, lName, email, address, city, state, zip } = selectedUser;
    const res = await fetch("/api/admin/users/update-details", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: _id, fName, lName, email, address, city, state, zip }),
    });
    if (res.ok) {
      alert("User details updated.");
      fetchUsers();
      setSelectedUser(null);
    } else {
      const data = await res.json();
      alert(data.error || "Failed to update user details.");
    }
  };

  const getHighestRole = (roles) => {
    for (let i = roleHierarchy.length - 1; i >= 0; i--) {
      if (roles.includes(roleHierarchy[i])) return roleHierarchy[i];
    }
    return "User";
  };

  const filteredUsers = users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.container}>
      {!selectedUser ? (
        <>
          <h1>Manage Users</h1>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchBar}
          />

          {loading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Last Login</th>
                  <th>Locked</th>
                  <th>Locked By</th>
                  <th>Last Locked</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <button onClick={() => setSelectedUser(user)} className={styles.linkButton}>
                        {user.username}
                      </button>
                      {user.accountLocked && <span className={styles.badge}>Locked</span>}
                    </td>
                    <td>
                      <select
                        value={getHighestRole(user.roles)}
                        onChange={(e) => handleUpdateRoles(user._id, e.target.value)}
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                        <option value="Owner">Owner</option>
                      </select>
                    </td>
                    <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</td>
                    <td>{user.accountLocked ? "Yes" : "No"}</td>
                    <td>{user.lockedBy || "-"}</td>
                    <td>{user.lockedAt ? new Date(user.lockedAt).toLocaleString() : "Never"}</td>
                    <td className={styles.actions}>
                      {!user.accountLocked && <button onClick={() => handleLock(user._id)}>Lock</button>}
                      {user.accountLocked && <button onClick={() => handleUnlock(user._id)}>Unlock</button>}
                      <button onClick={() => {
                        const pw = prompt("Enter temporary password:");
                        if (pw) handleResetPassword(user._id, pw);
                      }}>
                        Reset PW
                      </button>
                      <button onClick={() => handleDelete(user._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <div className={styles.userDetails}>
          <button className={styles.backArrow} onClick={() => setSelectedUser(null)}>
            <FiArrowLeft size={20} /> Back
          </button>
          <h2>{selectedUser.username}</h2>

          <label>First Name</label>
          <input value={selectedUser.fName || ""} onChange={(e) => setSelectedUser({ ...selectedUser, fName: e.target.value })} />

          <label>Last Name</label>
          <input value={selectedUser.lName || ""} onChange={(e) => setSelectedUser({ ...selectedUser, lName: e.target.value })} />

          <label>Email</label>
          <input value={selectedUser.email || ""} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />

          <label>Address</label>
          <input value={selectedUser.address || ""} onChange={(e) => setSelectedUser({ ...selectedUser, address: e.target.value })} />

          <label>City</label>
          <input value={selectedUser.city || ""} onChange={(e) => setSelectedUser({ ...selectedUser, city: e.target.value })} />

          <label>State</label>
          <input value={selectedUser.state || ""} onChange={(e) => setSelectedUser({ ...selectedUser, state: e.target.value })} />

          <label>ZIP</label>
          <input value={selectedUser.zip || ""} onChange={(e) => setSelectedUser({ ...selectedUser, zip: e.target.value })} />

          <div className={styles.actions}>
            <button onClick={handleSaveDetails}>Save Changes</button>
            <button onClick={() => setSelectedUser(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
