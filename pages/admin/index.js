import Link from "next/link";
import { requireAuth } from "../api/auth/requireAuth";
import AnnouncementControl from "../../components/Admin/AnnouncementControl/AnnouncementControl";
import BusinessHoursControl from "../../components/Admin/BusinessHoursControl/BusinessHoursControl";
import styles from "./styles/AdminPage.module.scss";

export const getServerSideProps = (ctx) => requireAuth(ctx, ["Admin"]);

export default function AdminHome() {
  return (
    <div className={styles.page}>
      <h1>Welcome to the Admin Dashboard</h1>
      <div className={styles.dashboardControls}>
        <AnnouncementControl />
        <BusinessHoursControl />
      </div>
    </div>
  );
}
