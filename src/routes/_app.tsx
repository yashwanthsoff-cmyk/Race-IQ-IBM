import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
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
