import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { GlobalProvider } from "@/context/GlobalContext";
import { Toaster } from "sonner";

import DidYouKnow from "@/components/common/DidYouKnow";
import VoiceButton from "@/components/voice/VoiceButton";

function NotFoundComponent() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div className="font-display" style={{ fontSize: 96, fontWeight: 300 }}>404</div>
        <p style={{ marginTop: 8, color: "#8F8F8F" }}>This route doesn't exist on the RaceIQ grid.</p>
        <a href="/" className="btn-primary" style={{ marginTop: 24 }}>Return to pits</a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <h1 style={{ fontSize: 24, fontWeight: 400 }}>This page didn't load</h1>
        <p style={{ marginTop: 8, color: "#8F8F8F", fontSize: 15 }}>{error.message}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
          <button className="btn-primary" onClick={() => { router.invalidate(); reset(); }}>Try again</button>
          <a href="/" className="btn-ghost">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RaceIQ — AI Race Strategy" },
      { name: "description", content: "AI-powered F1 race strategy copilot: real-time telemetry, predictive pit windows, and rival analysis." },
      { name: "author", content: "RaceIQ" },
      { property: "og:title", content: "RaceIQ — AI Race Strategy" },
      { property: "og:description", content: "AI-powered F1 race strategy copilot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Orbitron:wght@400;500&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalProvider>
        <Outlet />
        
        <VoiceButton />
        <DidYouKnow />
        <Toaster position="top-right" toastOptions={{
          style: {
            background: "rgba(253,253,253,0.95)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(15,16,18,0.08)",
            borderLeft: "2px solid #E3001E",
            borderRadius: 16, color: "#0F1012", fontFamily: "Inter", fontWeight: 300,
          },
        }} />
      </GlobalProvider>
    </QueryClientProvider>
  );
}
