import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import ToastContainer from './components/ToastContainer';
import ConfirmDialog from './components/ConfirmDialog';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ShopDetail from './pages/ShopDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import VerifyEmail from './pages/VerifyEmail';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Return from './pages/Return';
import Faq from './pages/Faq';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminForgotPassword from './pages/admin/AdminForgotPassword';
import AdminResetPassword from './pages/admin/AdminResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import OrdersAdmin from './pages/admin/OrdersAdmin';
import ProductInventory from './pages/admin/ProductInventory';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminPayments from './pages/admin/AdminPayments';
import AdminWebhookEvents from './pages/admin/AdminWebhookEvents';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Styles
import './styles/bootstrap.min.css';
import './styles/style.css';

function Root() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Home />;
}

function CustomersOnly() {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Outlet />;
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ToastProvider>
        <ConfirmProvider>
        <CartProvider>
          <Routes>
            {/* Customer Routes (admins are redirected to admin dashboard) */}
            <Route element={<CustomersOnly />}>
              <Route path="/" element={<Root />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:id" element={<ShopDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/return" element={<Return />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route
                path="/profile"
                element={(
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/orders"
                element={(
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/orders/:id"
                element={(
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                )}
              />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={(<ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>)} />
            <Route path="/admin/users" element={(<ProtectedRoute><AdminRoute><AdminUsers /></AdminRoute></ProtectedRoute>)} />
            <Route path="/admin/orders" element={(<ProtectedRoute><AdminRoute><OrdersAdmin /></AdminRoute></ProtectedRoute>)} />
            <Route path="/admin/products" element={(<ProtectedRoute><AdminRoute><AdminProducts /></AdminRoute></ProtectedRoute>)} />
            <Route path="/admin/products/:id/inventory" element={(<ProtectedRoute><AdminRoute><ProductInventory /></AdminRoute></ProtectedRoute>)} />
            <Route path="/admin/categories" element={(<ProtectedRoute><AdminRoute><AdminCategories /></AdminRoute></ProtectedRoute>)} />
            <Route path="/admin/payments" element={(<ProtectedRoute><AdminRoute><AdminPayments /></AdminRoute></ProtectedRoute>)} />
            <Route path="/admin/webhook-events" element={(<ProtectedRoute><AdminRoute><AdminWebhookEvents /></AdminRoute></ProtectedRoute>)} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer />
          <ConfirmDialog />
        </CartProvider>
        </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
