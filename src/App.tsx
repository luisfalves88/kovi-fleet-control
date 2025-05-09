
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";

// Auth Pages
import Login from "@/pages/auth/Login";
import ResetPassword from "@/pages/auth/ResetPassword";

// Main Pages
import Dashboard from "@/pages/Dashboard";
import Tasks from "@/pages/Tasks";
import TaskDetail from "@/pages/TaskDetail";
import Conversations from "@/pages/Conversations";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";

// Admin Pages
import Users from "@/pages/admin/Users";
import Partners from "@/pages/admin/Partners";
import Units from "@/pages/admin/Units";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children, requiredRoles = [] }: { children: React.ReactNode, requiredRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Layout wrapper with authentication check
const ProtectedLayout = ({ children, requiredRoles = [] }: { children: React.ReactNode, requiredRoles?: string[] }) => {
  return (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <SidebarProvider>
        <MainLayout>{children}</MainLayout>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Main Routes */}
            <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
            <Route path="/tasks" element={<ProtectedLayout><Tasks /></ProtectedLayout>} />
            <Route path="/tasks/:id" element={<ProtectedLayout><TaskDetail /></ProtectedLayout>} />
            <Route path="/conversations" element={<ProtectedLayout requiredRoles={['admin', 'member', 'partner']}><Conversations /></ProtectedLayout>} />
            <Route path="/reports" element={<ProtectedLayout requiredRoles={['admin', 'member']}><Reports /></ProtectedLayout>} />
            <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
            
            {/* Admin Routes */}
            <Route path="/users" element={<ProtectedLayout requiredRoles={['admin']}><Users /></ProtectedLayout>} />
            <Route path="/partners" element={<ProtectedLayout requiredRoles={['admin']}><Partners /></ProtectedLayout>} />
            <Route path="/units" element={<ProtectedLayout requiredRoles={['admin']}><Units /></ProtectedLayout>} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
