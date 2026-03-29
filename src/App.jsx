import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Schedule from './pages/Schedule';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

// Защищённый маршрут
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Макет без навбара и футера (для авторизации)
function AuthLayout({ children }) {
  return <>{children}</>;
}

// Макет с навбаром и футером
function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();
  
  return (
    <Routes>
      {/* Публичные страницы */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/about" element={<MainLayout><About /></MainLayout>} />
      <Route path="/services" element={<MainLayout><Services /></MainLayout>} />
      <Route path="/schedule" element={<MainLayout><Schedule /></MainLayout>} />
      <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
      
      {/* Авторизация */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <AuthLayout><Login /></AuthLayout>
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <AuthLayout><Register /></AuthLayout>
      } />
      
      {/* Личный кабинет */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          {isAdmin ? <AdminPanel /> : <Dashboard />}
        </PrivateRoute>
      } />
      
      {/* Редирект для старых URL */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
