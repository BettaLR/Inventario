import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductosPage from './pages/ProductosPage';
import CatalogosPage from './pages/CatalogosPage';
import KardexPage from './pages/KardexPage';
import ReportesPage from './pages/ReportesPage';
import UsuariosPage from './pages/UsuariosPage';
import NoAutorizadoPage from './pages/NoAutorizadoPage';
import EscanearPage from './pages/EscanearPage';
import ProductoEscaneadoPage from './pages/ProductoEscaneadoPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/no-autorizado" element={<NoAutorizadoPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/kardex" element={<KardexPage />} />
                <Route path="/productos" element={<ProductosPage />} />
                <Route path="/catalogos" element={<CatalogosPage />} />
                <Route path="/reportes" element={<ReportesPage />} />
                <Route path="/usuarios" element={<UsuariosPage />} />
              </Route>

              {/* Módulo de escaneo móvil: pantalla completa, sin chrome de escritorio */}
              <Route path="/escanear" element={<EscanearPage />} />
              <Route path="/escanear/producto/:codigo" element={<ProductoEscaneadoPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
