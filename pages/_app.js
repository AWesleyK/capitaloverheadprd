// /pages/_app.js
import "../styles/globals.scss";
import Layout from "../components/Layout/Layout";
import AdminLayout from "../components/Admin/AdminLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function MyApp({ Component, pageProps, services }) {
  const router = useRouter();
  const [fadeClass, setFadeClass] = useState("");

  const excludedAdminRoutes = ["/admin/login", "/admin/setup"];
  const isAdminRoute =
      router.pathname.startsWith("/admin") &&
      !excludedAdminRoutes.includes(router.pathname);

  const WrappedPage = isAdminRoute ? (
      <AdminLayout>
        <Component {...pageProps} />
      </AdminLayout>
  ) : (
      <div className={fadeClass}>
        <Component {...pageProps} />
      </div>
  );

  useEffect(() => {
    const handleRouteChange = () => {
      if (!isAdminRoute) {
        setFadeClass(""); // reset
        requestAnimationFrame(() => setFadeClass("pageFade"));
      }
    };

    handleRouteChange(); // initial load
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router, isAdminRoute]);

  return <Layout services={services || []}>{WrappedPage}</Layout>;
}

/**
 * Resolve the "public base URL" safely:
 * - Production: always use NEXT_PUBLIC_SITE_URL (recommended) or fallback to dinodoors.net
 * - Preview/other: if VERCEL_URL exists, use it
 * - Local dev: localhost
 */
function getPublicBaseUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/+$/, "");

  // Vercel provides this for preview/prod deployments (not always present locally)
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // Fallback
  return process.env.NODE_ENV === "production"
      ? "https://dinodoors.net"
      : "http://localhost:3000";
}

MyApp.getInitialProps = async ({ Component, ctx }) => {
  let pageProps = {};
  let services = [];

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  // Server-side only
  if (typeof window === "undefined") {
    const baseUrl = getPublicBaseUrl();

    try {
      const res = await fetch(`${baseUrl}/api/services/menu`, {
        headers: {
          // Helps avoid some edge cases where host-dependent logic exists
          "x-forwarded-host": "dinodoors.net",
        },
      });

      if (!res.ok) {
        throw new Error(`Services menu fetch failed: ${res.status} ${res.statusText}`);
      }

      services = await res.json();

      // Optional: ensure array shape
      if (!Array.isArray(services)) services = [];
    } catch (e) {
      console.error("Failed to fetch services:", e);
      services = [];
    }
  }

  return { pageProps, services };
};

export default MyApp;
