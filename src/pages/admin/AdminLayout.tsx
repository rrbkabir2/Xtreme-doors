// FILE: src/pages/admin/AdminLayout.tsx
// ACTION: Replace the ENTIRE file with this

import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useAdminTheme } from "./AdminThemeContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { LayoutDashboard, MessageSquareText, Package, Moon, Sun, LogOut, Users, Settings, Menu } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/quotes", label: "Quotes", icon: MessageSquareText, end: false },
  { to: "/admin/products", label: "Products", icon: Package, end: false },
  { to: "/admin/admins", label: "Admins", icon: Users, end: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
];

// Shared between the fixed desktop sidebar and the mobile slide-in
// sheet, so the two never drift out of sync visually or in behavior.
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { email, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center px-5 border-b border-border shrink-0">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary leading-none">Xtreme Doors</span>
          <span className="hidden lg:inline text-[10px] text-muted-foreground leading-none whitespace-nowrap">
            A unit of Hannure Doors
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 sm:py-2 rounded-md text-sm font-medium transition-smooth ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-2 shrink-0">
        <p className="px-3 text-xs text-muted-foreground truncate">{email}</p>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}

const AdminLayout = () => {
  const { theme, toggleTheme } = useAdminTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer automatically whenever the route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar — hidden below md, fixed width above it */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-border bg-card flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar — slide-in sheet, triggered by the hamburger in the header */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-card">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SheetDescription className="sr-only">Admin panel navigation menu</SheetDescription>
          <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 sm:h-16 border-b border-border flex items-center justify-between px-3 sm:px-6 bg-card shrink-0">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
          <span className="md:hidden font-semibold text-sm truncate">Xtreme Doors Admin</span>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </header>
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto overflow-x-hidden">
          <Outlet key={location.pathname} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;