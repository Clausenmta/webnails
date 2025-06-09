
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Esperar a que termine la verificación de autenticación

    if (user) {
      // Si está autenticado, redirigir al dashboard
      navigate("/dashboard");
    } else {
      // Si no está autenticado, redirigir al login
      navigate("/login");
    }
  }, [navigate, user, loading]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return null;
};

export default Index;
