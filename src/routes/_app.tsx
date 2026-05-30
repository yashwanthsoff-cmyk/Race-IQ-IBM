import { createFileRoute, Outlet } from "@tanstack/react-router";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import { useEffect } from "react";
import { subscribeToDecisions, subscribeToAnomalies, getOrCreateSession } from "@/services/DatabaseService";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  useEffect(() => {
    getOrCreateSession("Monaco Grand Prix 2024");
    const d = subscribeToDecisions((decision) => {
      console.log("New AI decision from Supabase:", decision);
    });
    const a = subscribeToAnomalies((alert) => {
      console.log("New anomaly from Supabase:", alert);
    });
    return () => { d.unsubscribe(); a.unsubscribe(); };
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      <Sidebar />
      <TopNavbar />
      <main style={{ marginLeft: 240, paddingTop: 56, minHeight: "100vh" }} className="app-main">
        <Outlet />
      </main>
      <style>{`
        @media (max-width: 768px) {
          .app-main { margin-left: 0 !important; padding-bottom: 80px; }
        }
      `}</style>
    </div>
  );
}
