// /pages/admin/patch-notes.js
import dynamic from "next/dynamic";
import { requireAuth } from "../api/auth/requireAuth";
import AdminLayout from "../../components/Admin/AdminLayout";
import { useEffect, useState } from "react";
import PatchNotes from "../../components/Admin/Pages/PatchNotes/PatchNotes"


export const getServerSideProps = (ctx) =>
  requireAuth(ctx, { roles: ["Admin", "Overlord"], minTier: 1 });

export default function PatchNotesPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <div>
      <h1>Patch Notes</h1>
      {user ? <PatchNotes user={user} /> : <p>Loading user info...</p>}
      </div>
  );
}
