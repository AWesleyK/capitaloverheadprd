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
        requestAnimationFrame(() => {
          setFadeClass("pageFade");
        });
      }
    };

    handleRouteChange(); // initial load
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router, isAdminRoute]);

  return (
    <Layout services={services || []}>
      {WrappedPage}
    </Layout>
  );
}

MyApp.getInitialProps = async ({ Component, ctx }) => {
  let pageProps = {};
  let services = [];

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  if (typeof window === "undefined") {
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = ctx?.req?.headers?.host || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    try {
      const res = await fetch(`${baseUrl}/api/services/menu`);
      services = await res.json();
    } catch (e) {
      console.error("Failed to fetch services:", e);
    }
  }

  return { pageProps, services };
};

export default MyApp;
