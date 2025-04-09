import { requireAuth } from "../api/auth/requireAuth";

export const getServerSideProps = (ctx) => requireAuth(ctx, ["Admin"]);

export default function SettingsPage() {
    return <div style={{ padding: "2rem" }}><h1>Modify Settings</h1></div>;
  }
  