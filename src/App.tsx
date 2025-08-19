import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { useState } from "react";
import { User } from "./types/admin";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const AppRoutes = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
      setCurrentUser(null);
      navigate('/login');
    };

    return (
      <Routes>
        <Route path="/" element={<LoginPage setCurrentUser={setCurrentUser} />} />
        <Route path="/login" element={<LoginPage setCurrentUser={setCurrentUser} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute currentUser={currentUser}>
              <AdminDashboard currentUser={currentUser} handleLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;