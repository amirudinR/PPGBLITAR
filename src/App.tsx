import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboardPage from "./pages/admin-dashboard/AdminDashboardPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import M5UDetailPage from "./pages/M5UDetailPage";
import { useState, useEffect, useCallback } from "react";
import { User } from "./types/admin";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

const queryClient = new QueryClient();

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkAuth = useCallback(() => {
    setLoading(true);
    setConnectionError(null);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Set timeout for Firestore fetch
          const firestoreTimeoutId = setTimeout(() => {
            setConnectionError("Koneksi ke Firestore terlalu lambat atau diblokir. Pastikan tidak ada ad blocker atau antivirus yang memblokir koneksi.");
            setLoading(false);
          }, 8000); // 8 second timeout for Firestore

          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            clearTimeout(firestoreTimeoutId);

            if (userDoc.exists()) {
              setCurrentUser({ id: user.uid, ...userDoc.data() } as User);
            } else {
              setCurrentUser(null);
              await signOut(auth);
            }
          } catch (error: any) {
            clearTimeout(firestoreTimeoutId);
            throw error;
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error: any) {
        console.error("Error validating auth session:", error);
        
        // Check for specific blocked client error
        if (error.message && error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
          setConnectionError("Koneksi Firebase diblokir oleh browser atau ekstensi. Nonaktifkan ad blocker, VPN, atau ekstensi privasi dan coba lagi.");
        } else if (error.code === 'unavailable' || error.code === 'failed-precondition') {
          setConnectionError("Tidak dapat terhubung ke Firebase. Periksa koneksi internet Anda.");
        } else {
          setConnectionError("Terjadi kesalahan koneksi: " + (error.message || "Unknown error"));
        }
        
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

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = checkAuth();
    return () => {
      unsubscribe();
    };
  }, [checkAuth, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

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

  if (connectionError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 p-8 max-w-md text-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-16 h-16 text-destructive" />
          <h2 className="text-xl font-semibold">Koneksi Gagal</h2>
        </div>
        
        <p className="text-muted-foreground">{connectionError}</p>
        
        <div className="flex flex-col gap-3 text-sm text-left w-full bg-muted/50 p-4 rounded-lg">
          <p className="font-semibold">Solusi yang mungkin:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Nonaktifkan ad blocker (uBlock, AdBlock, dll)</li>
            <li>Matikan VPN atau ekstensi privasi</li>
            <li>Periksa pengaturan antivirus/firewall</li>
            <li>Coba browser lain (Chrome, Firefox, Edge)</li>
            <li>Periksa koneksi internet Anda</li>
          </ul>
        </div>
        
        <Button onClick={handleRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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