import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

const NavItem = ({ to, icon, label }) => {
  const location = useLocation();
  const active = location.pathname === to || (to !== '/admin/dashboard' && location.pathname.startsWith(to));
  return (
    <li className="nav-item">
      <Link className={`nav-link ${active ? 'active' : ''}`} to={to}>
        <i className={`${icon} me-2`}></i>{label}
      </Link>
    </li>
  );
};

const AdminLayout = ({ title, children }) => {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onLogout = async () => {
    try { await logout(); navigate('/'); } catch {}
  };

  if (!isAdmin) {
    return (
      <div className="container py-5 text-center">
        <h5>Not authorized</h5>
        <Link to="/">Go to Store</Link>
      </div>
    );
  }

  const crumbs = location.pathname.split('/').filter(Boolean).slice(1); // drop leading 'admin'

  return (
    <div className={`container-fluid admin-dark ${sidebarOpen ? 'admin-has-sidebar-open' : ''}`}>
      <div className="row">
        {/* Sidebar */}
        <nav className="col-md-3 col-lg-2 d-md-block bg-dark sidebar min-vh-100 border-end text-white">
          <div className="position-sticky pt-3">
            <div className="px-3 d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-accent mb-0">Raddazle Admin</h5>
              {/* Close button visible on small screens */}
              <button className="btn btn-sm btn-outline-secondary d-md-none" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <ul className="nav flex-column">
              <NavItem to="/admin/dashboard" icon="fas fa-home" label="Dashboard" />
              <NavItem to="/admin/users" icon="fas fa-users" label="Users" />
              <NavItem to="/admin/categories" icon="fas fa-tags" label="Categories" />
              <NavItem to="/admin/products" icon="fas fa-box" label="Products" />
              <NavItem to="/admin/orders" icon="fas fa-shopping-cart" label="Orders" />
              <NavItem to="/admin/payments" icon="fas fa-receipt" label="Payments" />
              {/* Product admin pages can be added later */}
              {/* <NavItem to="/admin/products" icon="fas fa-box" label="Products" /> */}
            </ul>
          </div>
        </nav>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && <div className="sidebar-backdrop d-md-none" onClick={() => setSidebarOpen(false)}></div>}

        {/* Main */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 text-light">
          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
            <div>
              <h1 className="h4 mb-0">{title || 'Admin'}</h1>
              <small className="text-muted">Signed in as {user?.name} ({user?.role})</small>
            </div>
            <div className="d-flex gap-2">
              {/* Sidebar toggle button on mobile */}
              <button className="btn btn-sm btn-outline-secondary d-md-none" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
                <i className="fas fa-bars"></i>
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={onLogout}>Logout</button>
            </div>
          </div>

          {/* Breadcrumbs */}
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/admin/dashboard">Admin</Link></li>
              {crumbs.map((c, i) => (
                <li key={i} className={`breadcrumb-item ${i === crumbs.length-1 ? 'active' : ''}`} aria-current={i === crumbs.length-1 ? 'page' : undefined}>
                  {i === crumbs.length-1 ? c : <Link to={`/admin/${crumbs.slice(0, i+1).join('/')}`}>{c}</Link>}
                </li>
              ))}
            </ol>
          </nav>

          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
