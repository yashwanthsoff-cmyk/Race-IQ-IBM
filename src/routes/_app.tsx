import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import FocusVisibility from "@/components/common/FocusVisibility";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{ minHeight: "100vh" }}>
      <FocusVisibility />
      <Sidebar />
      <TopNavbar />
      <main style={{ marginLeft: 240, paddingTop: 56, minHeight: "100vh" }} className="app-main">
        {mounted ? <Outlet /> : null}
      </main>
      <style>{`
        @media (max-width: 768px) {
          .app-main { margin-left: 0 !important; padding-bottom: 80px; }
        }
      `}</style>
    </div>
  );
}
