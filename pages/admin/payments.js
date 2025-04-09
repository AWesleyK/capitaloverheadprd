
import { requireAuth } from "../api/auth/requireAuth";

export const getServerSideProps = (ctx) => requireAuth(ctx, ["Admin"]);

export default function PaymentsPage() {
    return <div style={{ padding: "2rem" }}><h1>Modify Payments</h1></div>;
  }
  