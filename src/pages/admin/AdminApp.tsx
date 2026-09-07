import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminThemeProvider } from "./AdminThemeContext";
import ProtectedRoute from "./ProtectedRoute";
import AdminLogin from "./AdminLogin";
import AdminForgotPassword from "./AdminForgotPassword";
import AdminResetPassword from "./AdminResetPassword";
import AdminOAuthCallback from "./AdminOAuthCallback";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminQuotes from "./AdminQuotes";
import AdminProducts from "./AdminProducts";
import AdminAdmins from "./AdminAdmins";
import AdminSettings from "./AdminSettings";

const AdminApp = () => (
  <AdminThemeProvider>
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route path="forgot-password" element={<AdminForgotPassword />} />
        <Route path="reset-password" element={<AdminResetPassword />} />
        <Route path="oauth-callback" element={<AdminOAuthCallback />} />
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
          <Route path="admins" element={<AdminAdmins />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  </AdminThemeProvider>
);

export default AdminApp;
