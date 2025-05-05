
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import GiftCardsPage from "./pages/GiftCardsPage";
import StockPage from "./pages/StockPage";
import ArreglosPage from "./pages/ArreglosPage";
import GastosPage from "./pages/GastosPage";
import EmpleadosPage from "./pages/EmpleadosPage";
import ResultadosPage from "./pages/ResultadosPage";
import FacturacionPage from "./pages/FacturacionPage";
import AusenciasPage from "./pages/AusenciasPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Create a new QueryClient instance with reset-on-error configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Create the App component as a function component to properly use hooks
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/gift-cards" element={<GiftCardsPage />} />
                <Route path="/stock" element={<StockPage />} />
                <Route path="/arreglos" element={<ArreglosPage />} />
                <Route path="/gastos" element={<GastosPage />} />
                <Route path="/empleados" element={
                  <ProtectedRoute requiredRole="superadmin">
                    <EmpleadosPage />
                  </ProtectedRoute>
                } />
                <Route path="/ausencias" element={
                  <ProtectedRoute requiredRole="superadmin">
                    <AusenciasPage />
                  </ProtectedRoute>
                } />
                <Route path="/resultados" element={
                  <ProtectedRoute requiredRole="superadmin">
                    <ResultadosPage />
                  </ProtectedRoute>
                } />
                <Route path="/facturacion" element={
                  <ProtectedRoute requiredRole="superadmin">
                    <FacturacionPage />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
