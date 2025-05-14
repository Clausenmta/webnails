import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './contexts/AuthContext';
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
import { Toaster } from './components/ui/toaster';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import ProtectedRoute from './components/auth/ProtectedRoute';

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
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/empleados" 
                element={
                  <ProtectedRoute>
                    <EmpleadosPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gastos" 
                element={
                  <ProtectedRoute>
                    <GastosPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resultados" 
                element={
                  <ProtectedRoute>
                    <ResultadosPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ausencias" 
                element={
                  <ProtectedRoute>
                    <AusenciasPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/arreglos" 
                element={
                  <ProtectedRoute>
                    <ArreglosPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tarjetas" 
                element={
                  <ProtectedRoute>
                    <GiftCardsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/stock" 
                element={
                  <ProtectedRoute>
                    <StockPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/facturacion" 
                element={
                  <ProtectedRoute>
                    <FacturacionPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
