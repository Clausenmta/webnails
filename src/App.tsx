
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/gift-cards" element={<GiftCardsPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/arreglos" element={<ArreglosPage />} />
            <Route path="/gastos" element={<GastosPage />} />
            <Route path="/empleados" element={<EmpleadosPage />} />
            <Route path="/resultados" element={<ResultadosPage />} />
            <Route path="/facturacion" element={<FacturacionPage />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
