import { requireAuth } from "../api/auth/requireAuth";
import { useEffect, useState } from "react";
import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "./styles/AdminPage.module.scss";
import AnnouncementControl from "../../components/Admin/Widgets/AnnouncementControl/AnnouncementControl";
import BusinessHoursControl from "../../components/Admin/Widgets/BusinessHoursControl/BusinessHoursControl";
import SearchLogs from "../../components/Admin/Widgets/SearchLogs/SearchLogs";
import QuickNotes from "../../components/Admin/Widgets/QuickNotes/QuickNotes";
import RebuildSite from "../../components/Admin/Widgets/RebuildSite/RebuildSite";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export const getServerSideProps = (ctx) =>
  requireAuth(ctx, { roles: ["Admin", "User", "Owner"], minTier: 1 });

const CONTROL_COMPONENTS = {
  AnnouncementControl: <AnnouncementControl />,
  BusinessHoursControl: <BusinessHoursControl />,
  SearchLogs: <SearchLogs />,
  QuickNotes: <QuickNotes />,
  RebuildSite: <RebuildSite />,
};

const WIDGET_ACCESS = {
  RebuildSite: { roles: ["Admin", "Owner"] },
};

const DEFAULT_LAYOUT = [
  "AnnouncementControl",
  "BusinessHoursControl",
  "SearchLogs",
  "QuickNotes",
  "RebuildSite",
];

export default function AdminHome() {
  const router = useRouter();
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [user, setUser] = useState(null);

  const fetchLayoutAndStatus = async () => {
    try {
      const [statusRes, layoutRes, userRes] = await Promise.all([
        fetch("/api/admin/payments/settings"),
        fetch("/api/admin/dashboard/layout/get"),
        fetch("/api/auth/me"),
      ]);

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setSubscriptionStatus(statusData.subscriptionStatus);
      }

      if (layoutRes.ok) {
        const data = await layoutRes.json();
        const current = new Set(data);
        const completeLayout = [
          ...data,
          ...DEFAULT_LAYOUT.filter((widget) => !current.has(widget)),
        ];
        setLayout(completeLayout);
      } else {
        setLayout(DEFAULT_LAYOUT);
      }

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setLayout(DEFAULT_LAYOUT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayoutAndStatus();

    const refreshOnFocus = () => {
      fetch("/api/admin/payments/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data?.subscriptionStatus) {
            setSubscriptionStatus(data.subscriptionStatus);
          }
        });
    };

    window.addEventListener("focus", refreshOnFocus);
    return () => window.removeEventListener("focus", refreshOnFocus);
  }, []);

  useEffect(() => {
    if (router.query.status === "success") {
      fetchLayoutAndStatus();
      router.replace("/admin", undefined, { shallow: true });
    }
  }, [router.query]);

  const handleDragEnd = async (result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    const updated = Array.from(layout);
    const [moved] = updated.splice(source.index, 1);
    updated.splice(destination.index, 0, moved);
    setLayout(updated);

    try {
      await fetch("/api/admin/dashboard/layout/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout: updated }),
      });
    } catch (err) {
      console.error("Failed to save layout:", err);
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading dashboard...</p>;

  const isSubscribed = ["active", "trialing", "past_due"].includes(subscriptionStatus);

  if (!isSubscribed) {
    return (
      <div className={styles.page}>
        <h1>Your Subscription is Not Active</h1>
        <p style={{ fontSize: "1.1rem", marginTop: "1rem" }}>
          To access the admin dashboard, please continue to the payments page.
        </p>
        <Link href="/admin/payments">
          <button className={styles.button} style={{ marginTop: "1rem" }}>
            Continue to Payments
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>Welcome to the Admin Dashboard</h1>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard">
          {(provided) => (
            <div
              className={styles.dashboardGrid}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {layout.map((key, index) => {
                const allowedRoles = user?.roles || [];
                const allowed = (WIDGET_ACCESS[key]?.roles || []).some(role => allowedRoles.includes(role)) || !WIDGET_ACCESS[key];

                const Component = CONTROL_COMPONENTS[key];
                return (
                  <Draggable key={key} draggableId={key} index={index}>
                    {(provided) => (
                      <div
                        className={`${styles.gridItem} ${!allowed ? styles.disabledTile : ""}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {Component && React.cloneElement(Component, { disabled: !allowed })}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
