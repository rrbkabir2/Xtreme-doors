import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useAdminTheme } from "./AdminThemeContext";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MessageSquareText, Package, Moon, Sun, LogOut, Users, Settings } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/quotes", label: "Quotes", icon: MessageSquareText, end: false },
  { to: "/admin/products", label: "Products", icon: Package, end: false },
  { to: "/admin/admins", label: "Admins", icon: Users, end: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
];

const AdminLayout = () => {
  const { email, logout } = useAdminAuth();
  const { theme, toggleTheme } = useAdminTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-border">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary leading-none">Xtreme Doors</span>
            <span className="hidden lg:inline text-[10px] text-muted-foreground leading-none whitespace-nowrap">A unit of Hannure Doors</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <p className="px-3 text-xs text-muted-foreground truncate">{email}</p>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-end px-6 bg-card">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;