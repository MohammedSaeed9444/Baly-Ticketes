import { Link, useLocation } from "react-router-dom";
import { FileText, LayoutDashboard, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/create", icon: FileText, label: "Create Ticket" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <Ticket className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">CRM Ticketing</h1>
                <p className="text-xs text-muted-foreground">Support Management System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
};
