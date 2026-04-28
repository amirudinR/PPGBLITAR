import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboardPage from "./pages/admin-dashboard/AdminDashboardPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import M5UDetailPage from "./pages/M5UDetailPage";
import { useState, useEffect } from "react";
import { User } from "./types/admin";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const queryClient = new QueryClient();

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setCurrentUser({ id: user.uid, ...userDoc.data() } as User);
          } else {
            setCurrentUser(null);
            await signOut(auth);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error validating auth session:", error);
        setCurrentUser(null);
        try {
          await signOut(auth);
        } catch {
          // no-op
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    // Navigasi akan ditangani secara otomatis oleh perubahan state
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <DotLottieReact
          src="https://lottie.host/3c289c4b-9501-42d4-986f-a33a8cfaf7c5/qlV5HiJX1K.lottie"
          loop
          autoplay
          style={{ width: 120, height: 120 }}
        />
        <p className="text-sm text-muted-foreground animate-pulse">Memuat...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {currentUser ? (
              <>
                <Route 
                  path="/admin" 
                  element={<AdminDashboardPage currentUser={currentUser} handleLogout={handleLogout} />} 
                />
                <Route
                  path="/admin/m5u/:bulan/:tahun"
                  element={<M5UDetailPage currentUser={currentUser} />}
                />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </>
            ) : (
              <>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;