import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { categoryService } from '../services';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close nav when route changes
  useEffect(() => {
    setNavOpen(false);
    setShopDropdownOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Handle scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getAll({ includeCounts: true });
        setCategories(res.categories || []);
      } catch {
        // Silently fail
      }
    };
    loadCategories();
  }, []);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (navOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [navOpen]);

  // Focus search input when search overlay opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setShopDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        if (navOpen) setNavOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [searchOpen, navOpen]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setNavOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
    setSearchOpen(false);
    setNavOpen(false);
    setSearchQuery('');
  }, [searchQuery, navigate]);

  const closeNav = useCallback(() => {
    setNavOpen(false);
    setShopDropdownOpen(false);
    setUserDropdownOpen(false);
  }, []);

  const toggleShopDropdown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShopDropdownOpen(prev => !prev);
    setUserDropdownOpen(false);
  }, []);

  const toggleUserDropdown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setUserDropdownOpen(prev => !prev);
    setShopDropdownOpen(false);
  }, []);

  const cartCount = getCartCount();

  return (
    <header className={`navbar-wrapper ${scrolled ? 'is-scrolled' : ''}`} ref={navRef}>
      <div className="container">
        <nav className="navbar navbar-light bg-white navbar-expand-lg" role="navigation" aria-label="Main navigation">
          {/* Brand */}
          <Link to="/" className="navbar-brand hover-shine" onClick={closeNav}>
            <h1 className="text-primary display-6 brand-title mb-0">Ray Dazzle</h1>
            <p className="text-muted mb-0 brand-subtitle">Products that elude luxury</p>
          </Link>

          {/* Mobile Actions (Cart + Search + Hamburger) */}
          <div className="navbar-mobile-actions d-lg-none d-flex align-items-center gap-2">
            <button 
              className="btn btn-mobile-icon" 
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <i className="fas fa-search"></i>
            </button>
            
            <Link to="/cart" className="btn btn-mobile-icon position-relative" onClick={closeNav} aria-label="Shopping cart">
              <i className="fa fa-shopping-bag"></i>
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </Link>

            <button 
              className={`navbar-toggler ${navOpen ? 'is-active' : ''}`}
              type="button"
              aria-controls="navbarCollapse"
              aria-expanded={navOpen}
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setNavOpen(prev => !prev)}
            >
              <span className="hamburger-box">
                <span className="hamburger-inner"></span>
              </span>
            </button>
          </div>

          {/* Mobile Nav Backdrop */}
          <div 
            className={`nav-backdrop ${navOpen ? 'show' : ''}`} 
            onClick={closeNav}
            aria-hidden="true"
          />

          {/* Navigation Drawer */}
          <div 
            className={`navbar-collapse ${navOpen ? 'show' : ''}`} 
            id="navbarCollapse"
          >
            {/* Mobile header inside drawer */}
            <div className="mobile-nav-header d-lg-none">
              <Link to="/" className="mobile-brand" onClick={closeNav}>
                <i className="fas fa-gem text-primary me-2"></i>
                <span className="text-primary fw-bold">Ray Dazzle</span>
              </Link>
              <button 
                className="btn-close-nav" 
                onClick={closeNav}
                aria-label="Close menu"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Mobile Search Bar inside drawer */}
            <div className="mobile-search-bar d-lg-none">
              <form onSubmit={handleSearch} className="mobile-search-form">
                <div className="input-group">
                  <input 
                    type="search"
                    className="form-control"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </form>
            </div>

            {/* Nav Links */}
            <div className="navbar-nav mx-auto nav-underline">
              <NavLink 
                to="/" 
                end 
                className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`} 
                onClick={closeNav}
              >
                <i className="fas fa-home d-lg-none me-2"></i>
                Home
              </NavLink>

              {/* Shop Dropdown */}
              <div className={`nav-item dropdown ${shopDropdownOpen ? 'show' : ''}`}>
                <button
                  className={`nav-link dropdown-toggle ${location.pathname === '/shop' || location.pathname.startsWith('/shop') ? 'active' : ''}`}
                  onClick={toggleShopDropdown}
                  aria-expanded={shopDropdownOpen}
                  aria-haspopup="true"
                >
                  <i className="fas fa-store d-lg-none me-2"></i>
                  Shop
                </button>
                <ul className={`dropdown-menu ${shopDropdownOpen ? 'show' : ''}`}>
                  <li>
                    <Link className="dropdown-item" to="/shop" onClick={closeNav}>
                      <i className="fas fa-th-large me-2 text-muted"></i>
                      All Products
                    </Link>
                  </li>
                  {categories.length > 0 && <li><hr className="dropdown-divider" /></li>}
                  {categories.slice(0, 8).map(cat => (
                    <li key={cat._id}>
                      <Link 
                        className="dropdown-item" 
                        to={`/shop?category=${cat._id}`} 
                        onClick={closeNav}
                      >
                        {cat.name}
                        {typeof cat.productCount === 'number' && (
                          <span className="badge bg-light text-muted ms-2">{cat.productCount}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <NavLink 
                to="/about" 
                className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`} 
                onClick={closeNav}
              >
                <i className="fas fa-info-circle d-lg-none me-2"></i>
                About
              </NavLink>

              <NavLink 
                to="/contact" 
                className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`} 
                onClick={closeNav}
              >
                <i className="fas fa-envelope d-lg-none me-2"></i>
                Contact
              </NavLink>

              <NavLink 
                to="/faq" 
                className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`} 
                onClick={closeNav}
              >
                <i className="fas fa-question-circle d-lg-none me-2"></i>
                FAQs
              </NavLink>

              {isAuthenticated && isAdmin && (
                <NavLink 
                  to="/admin/dashboard" 
                  className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`} 
                  onClick={closeNav}
                >
                  <i className="fas fa-cog d-lg-none me-2"></i>
                  Admin
                </NavLink>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="navbar-actions d-none d-lg-flex align-items-center gap-3">
              <button 
                className="btn-search btn border border-secondary btn-md-square rounded-circle bg-white btn-glow" 
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search products"
              >
                <i className="fas fa-search text-primary"></i>
              </button>

              <Link to="/cart" className="btn-cart position-relative" aria-label="Shopping cart">
                <i className="fa fa-shopping-bag fa-2x"></i>
                {cartCount > 0 && (
                  <span className="cart-badge-lg">{cartCount > 99 ? '99+' : cartCount}</span>
                )}
              </Link>

              {isAuthenticated ? (
                <>
                  {!isAdmin && (
                    <button
                      onClick={handleLogout}
                      className="btn border border-secondary rounded-pill px-3 text-primary btn-glow"
                      type="button"
                      title="Logout"
                    >
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                  )}
                  <div className={`dropdown ${userDropdownOpen ? 'show' : ''}`}>
                    <button 
                      className="btn border border-secondary rounded-pill px-3 text-primary" 
                      type="button" 
                      onClick={toggleUserDropdown}
                      aria-expanded={userDropdownOpen}
                      aria-haspopup="true"
                    >
                      <i className="fas fa-user me-2"></i>
                      <span className="user-name">{user?.name?.split(' ')[0] || 'Account'}</span>
                    </button>
                    <ul className={`dropdown-menu dropdown-menu-end ${userDropdownOpen ? 'show' : ''}`}>
                      <li><Link className="dropdown-item" to="/profile" onClick={closeNav}>
                        <i className="fas fa-user-circle me-2"></i>Profile
                      </Link></li>
                      <li><Link className="dropdown-item" to="/orders" onClick={closeNav}>
                        <i className="fas fa-box me-2"></i>My Orders
                      </Link></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                          <i className="fas fa-sign-out-alt me-2"></i>Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link to="/login" className="btn border border-secondary rounded-pill px-3 text-primary btn-glow">
                    <i className="fas fa-user me-2"></i>Login
                  </Link>
                  <Link to="/register" className="btn btn-primary rounded-pill px-3 text-white btn-glow">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Auth Section */}
            <div className="mobile-auth-section d-lg-none">
              {isAuthenticated ? (
                <div className="mobile-user-info">
                  <div className="mobile-user-avatar">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <div className="mobile-user-details">
                    <span className="mobile-user-name">{user?.name || 'User'}</span>
                    <span className="mobile-user-email">{user?.email || ''}</span>
                  </div>
                </div>
              ) : null}
              
              <div className="mobile-auth-links">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="mobile-auth-link" onClick={closeNav}>
                      <i className="fas fa-user-circle me-2"></i>Profile
                    </Link>
                    <Link to="/orders" className="mobile-auth-link" onClick={closeNav}>
                      <i className="fas fa-box me-2"></i>My Orders
                    </Link>
                    <button className="mobile-auth-link text-danger w-100 text-start" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i>Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-outline-primary w-100 mb-2" onClick={closeNav}>
                      <i className="fas fa-sign-in-alt me-2"></i>Login
                    </Link>
                    <Link to="/register" className="btn btn-primary w-100" onClick={closeNav}>
                      <i className="fas fa-user-plus me-2"></i>Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search products">
          <div className="search-backdrop" onClick={() => setSearchOpen(false)} aria-hidden="true" />
          <div className="search-panel" role="document">
            <div className="search-header">
              <h6 className="mb-0 fw-semibold">Search products</h6>
              <button 
                className="btn btn-sm btn-close-search" 
                onClick={() => setSearchOpen(false)} 
                aria-label="Close search"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="search-body">
              <form onSubmit={handleSearch} className="search-form">
                <div className="input-group input-group-lg search-input">
                  <span className="input-group-text">
                    <i className="fa fa-search"></i>
                  </span>
                  <input 
                    ref={searchInputRef}
                    type="search" 
                    className="form-control"
                    placeholder="Search by name, brand, category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search query"
                  />
                  <button type="submit" className="btn btn-primary">
                    Search
                  </button>
                </div>
              </form>
              <div className="search-hints">
                <small className="text-muted">
                  <i className="fas fa-lightbulb me-1"></i>
                  Try: "sweet", "floral", "Tom Ford", "gift"
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
