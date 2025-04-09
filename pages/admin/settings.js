import { requireAuth } from "../api/auth/requireAuth";

export const getServerSideProps = (ctx) =>
  requireAuth(ctx, { roles: ["Admin"], minTier: 2 });

export default function SettingsPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Modify Settings</h1>
    </div>
  );
}
