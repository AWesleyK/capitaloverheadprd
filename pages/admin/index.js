import { requireAuth } from "../api/auth/requireAuth";
import { useEffect, useState } from "react";
import styles from "./styles/AdminPage.module.scss";
import AnnouncementControl from "../../components/Admin/Widgets/AnnouncementControl/AnnouncementControl";
import BusinessHoursControl from "../../components/Admin/Widgets/BusinessHoursControl/BusinessHoursControl";
import SearchLogs from "../../components/Admin/Widgets/SearchLogs/SearchLogs";
import QuickNotes from "../../components/Admin/Widgets/QuickNotes/QuickNotes";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export const getServerSideProps = (ctx) => requireAuth(ctx, ["Admin"]);

const CONTROL_COMPONENTS = {
  AnnouncementControl: <AnnouncementControl />,
  BusinessHoursControl: <BusinessHoursControl />,
  SearchLogs: <SearchLogs />,
  QuickNotes: <QuickNotes />,
};

const DEFAULT_LAYOUT = [
  "AnnouncementControl",
  "BusinessHoursControl",
  "SearchLogs",
  "QuickNotes",
];

export default function AdminHome() {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await fetch("/api/admin/dashboard/layout/get");
        if (res.ok) {
          const data = await res.json();

          const current = new Set(data);
          const completeLayout = [
            ...data,
            ...DEFAULT_LAYOUT.filter((widget) => !current.has(widget)),
          ];

          setLayout(completeLayout);
        } else {
          setLayout(DEFAULT_LAYOUT);
        }
      } catch (err) {
        console.error("Failed to load layout:", err);
        setLayout(DEFAULT_LAYOUT);
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, []);

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
              {layout.map((key, index) => (
                <Draggable key={key} draggableId={key} index={index}>
                  {(provided) => (
                    <div
                      className={styles.gridItem}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {CONTROL_COMPONENTS[key]}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
