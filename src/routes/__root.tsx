import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import appCss from "../styles.css?url";
import { supabase } from "@/integrations/supabase/client";
import {
  REMEMBER_SESSION_STORAGE_KEY,
  getRememberSessionPreference,
  shouldAutoSignOutOnVisibilityHidden,
} from "@/lib/session-timeout";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
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
      { title: "Mallorca Holística — Profesionales verificados de bienestar" },
      {
        name: "description",
        content:
          "Encuentra terapeutas y profesionales verificados en terapias naturales y complementarias en Mallorca.",
      },
      { name: "author", content: "Mallorca Holística" },
      { property: "og:title", content: "Mallorca Holística — Profesionales verificados de bienestar" },
      {
        property: "og:description",
        content:
          "Un espacio de confianza para encontrar profesionales verificados de bienestar en Mallorca.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Mallorca Holística — Profesionales verificados de bienestar" },
      { name: "description", content: "Mallorca Holistica" },
      { property: "og:description", content: "Mallorca Holistica" },
      { name: "twitter:description", content: "Mallorca Holistica" },
      { property: "og:image", content: "https://mallorcaholistica.com/hero-branch.jpg" },
      { name: "twitter:image", content: "https://mallorcaholistica.com/hero-branch.jpg" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "apple-touch-icon",
        href: "/favicon.png",
      },
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
      <head>
        <HeadContent />
      </head>
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
      <SessionActivityGuard />
      <Outlet />
    </QueryClientProvider>
  );
}

function SessionActivityGuard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const timerRef = useRef<number | null>(null);
  const signingOutRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hasRememberPreference = useCallback(() => {
    if (typeof window === "undefined") return false;
    return getRememberSessionPreference(window.localStorage.getItem(REMEMBER_SESSION_STORAGE_KEY));
  }, []);

  const signOutAndRedirect = useCallback(async () => {
    if (signingOutRef.current) return;
    signingOutRef.current = true;
    clearTimer();

    try {
      await supabase.auth.signOut();
    } finally {
      navigate({ to: "/login", search: { reason: "inactive" } });
    }
  }, [clearTimer, navigate]);

  const resetTimer = useCallback(() => {
    clearTimer();
    if (!session) return;

    timerRef.current = window.setTimeout(
      () => {
        void signOutAndRedirect();
      },
      30 * 60 * 1000,
    );
  }, [clearTimer, session, signOutAndRedirect]);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (!data.session) signingOutRef.current = false;
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        signingOutRef.current = false;
        clearTimer();
        return;
      }

      signingOutRef.current = false;
      clearTimer();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
      clearTimer();
    };
  }, [clearTimer]);

  useEffect(() => {
    if (!session) return;

    resetTimer();

    const handleActivity = () => resetTimer();
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        shouldAutoSignOutOnVisibilityHidden(hasRememberPreference())
      ) {
        void signOutAndRedirect();
      }
    };
    const handlePageHide = () => {
      if (shouldAutoSignOutOnVisibilityHidden(hasRememberPreference())) {
        void signOutAndRedirect();
      }
    };

    window.addEventListener("mousemove", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      clearTimer();
    };
  }, [clearTimer, hasRememberPreference, resetTimer, session, signOutAndRedirect]);

  return null;
}
