
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from '@/hooks/use-toast';
import { Toaster } from './components/ui/toaster';
import './App.css';

// Import pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmpleadosPage from './pages/EmpleadosPage';
import GastosPage from './pages/GastosPage';
import ResultadosPage from './pages/ResultadosPage';
import AusenciasPage from './pages/AusenciasPage';
import ArreglosPage from './pages/ArreglosPage';
import GiftCardsPage from './pages/GiftCardsPage';
import StockPage from './pages/StockPage';
import FacturacionPage from './pages/FacturacionPage';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ToastProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Rutas protegidas con la barra lateral */}
                <Route element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/empleados" element={<EmpleadosPage />} />
                  <Route path="/gastos" element={<GastosPage />} />
                  <Route path="/resultados" element={<ResultadosPage />} />
                  <Route path="/ausencias" element={<AusenciasPage />} />
                  <Route path="/arreglos" element={<ArreglosPage />} />
                  <Route path="/gift-cards" element={<GiftCardsPage />} />
                  <Route path="/stock" element={<StockPage />} />
                  <Route path="/facturacion" element={<FacturacionPage />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </ToastProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
