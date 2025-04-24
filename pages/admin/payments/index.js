import { requireAuth } from "../../api/auth/requireAuth";
import { useEffect, useState } from "react";
import styles from "../styles/PaymentsPage.module.scss";

export const getServerSideProps = async (ctx) => {
  const auth = requireAuth(ctx, { roles: ["Owner"], minTier: 1 });
  return auth;
};

export default function PaymentsPage() {
  const [status, setStatus] = useState(null);
  const [setupPaid, setSetupPaid] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [tier, setTier] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSubscribed = ["active", "trialing", "past_due"].includes(subscriptionStatus);

  useEffect(() => {
    const loadAll = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get("status");

      if (paymentStatus === "success") {
        setStatus("success");

        // ✅ Mark setup as paid
        const res = await fetch("/api/admin/payments/mark-setup-paid", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          setSetupPaid(true);

          // ✅ Update subscription status
          const resSub = await fetch("/api/admin/payments/update-status");
          const subData = await resSub.json();
          if (subData?.status) setSubscriptionStatus(subData.status);
        }
      } else if (paymentStatus === "cancelled") {
        setStatus("cancelled");
      }

      // ✅ Load current status
      const statusRes = await fetch("/api/admin/payments/settings");
      const settings = await statusRes.json();
      if (settings) {
        setSetupPaid(settings.setupFeePaid);
        setSubscriptionStatus(settings.subscriptionStatus);
        setTier(settings.tier);
      }

      // ✅ Load past invoices
      const invRes = await fetch("/api/admin/payments/invoices");
      const invData = await invRes.json();
      if (invData?.invoices) setInvoices(invData.invoices);

      setLoading(false);
    };

    loadAll();
  }, []);

  const handleStripeCheckout = async () => {
    const res = await fetch("/api/admin/payments/checkout-session", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Something went wrong while creating the checkout session.");
    }
  };

  const handleCancelSubscription = async () => {
    const res = await fetch("/api/admin/payments/cancel", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      alert("Subscription cancelled.");
      setSubscriptionStatus("canceled");
    } else {
      alert("Something went wrong.");
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading billing details...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Subscription & Billing</h1>

      {status === "success" && (
        <p className={`${styles.statusMessage} ${styles.success}`}>✅ Payment successful!</p>
      )}
      {status === "cancelled" && (
        <p className={`${styles.statusMessage} ${styles.cancelled}`}>❌ Payment was cancelled.</p>
      )}

      <div className={styles.section}>
        <h3>Current Plan</h3>
        <p className={styles.planInfo}>Tier: <strong>{tier}</strong></p>
        <p className={styles.planInfo}>
          Setup Fee Paid: <strong style={{ color: setupPaid ? "green" : "red" }}>
            {setupPaid ? "Yes" : "No"}
          </strong>
        </p>
        <p className={styles.planInfo}>
          Subscription Status: <strong>{subscriptionStatus}</strong>
        </p>
      </div>

      {!setupPaid || !isSubscribed ? (
        <button onClick={handleStripeCheckout} className={styles.button}>
          {setupPaid ? "Start Subscription" : "Pay Setup Fee & Subscribe"}
        </button>
      ) : (
        <button onClick={handleCancelSubscription} className={styles.button}>
          Cancel Subscription
        </button>
      )}

      {invoices.length > 0 && (
        <div className={styles.invoiceList}>
          <h4>Past Invoices</h4>
          <ul>
            {invoices.map((inv) => (
              <li key={inv.id}>
                <a href={inv.hosted_invoice_url} target="_blank" rel="noreferrer">
                  {new Date(inv.created * 1000).toLocaleDateString()} — ${(inv.amount_paid / 100).toFixed(2)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
