import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate({ to: "/login" });
      } else {
        setUser(data.user);
        // Check if admin
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle()
          .then(({ data: roleData }) => {
            if (roleData?.role === "admin") {
              setIsAdmin(true);
            }
            setLoading(false);
          });
      }
    });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Simplify Header for Dashboard */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-6">
          <Link to="/" className="font-display text-xl text-foreground">
            Mallorca Holística
          </Link>
          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col gap-8 px-6 py-8 md:flex-row md:px-10">
        <aside className="w-full shrink-0 md:w-64">
          <nav className="flex flex-col gap-2">
            <Link
              to="/dashboard"
              className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
              activeProps={{ className: "bg-muted font-medium" }}
              activeOptions={{ exact: true }}
            >
              Mi Perfil
            </Link>
            <Link
              to="/dashboard/analytics"
              className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
              activeProps={{ className: "bg-muted font-medium" }}
            >
              Estadísticas
            </Link>
            <Link
              to="/dashboard/billing"
              className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
              activeProps={{ className: "bg-muted font-medium" }}
            >
              Suscripción
            </Link>
            {isAdmin && (
              <>
                <Link
                  to="/dashboard/admin"
                  className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary transition-colors hover:bg-primary/20"
                  activeProps={{ className: "bg-primary/20 font-medium" }}
                >
                  Administración
                </Link>
                <Link
                  to="/dashboard/admin/analytics"
                  className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary transition-colors hover:bg-primary/20"
                  activeProps={{ className: "bg-primary/20 font-medium" }}
                >
                  Estadísticas globales
                </Link>
              </>
            )}
          </nav>
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
