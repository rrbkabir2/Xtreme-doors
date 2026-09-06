import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminThemeProvider } from "./AdminThemeContext";
import ProtectedRoute from "./ProtectedRoute";
import AdminLogin from "./AdminLogin";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminQuotes from "./AdminQuotes";
import AdminProducts from "./AdminProducts";

// Mounted only under /admin/* — this is why the session-check API call
// in AdminAuthProvider never fires on public marketing pages, and why
// the admin dark/light toggle never affects the public site's look.
const AdminApp = () => (
  <AdminThemeProvider>
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="quotes" element={<AdminQuotes />} />
          <Route path="products" element={<AdminProducts />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  </AdminThemeProvider>
);

export default AdminApp;
