import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { categoryService } from '../services';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getAll({ includeCounts: true });
        setCategories(res.categories || []);
      } catch {}
    };
    loadCategories();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${searchQuery}`);
    }
    setSearchOpen(false);
    setNavOpen(false);
  };

  return (
    <div className={`container-fluid fixed-top ${scrolled ? 'is-scrolled' : ''}`}>

      <div className="container px-0">
        <nav className="navbar navbar-light bg-white navbar-expand-lg">
          <Link to="/" className="navbar-brand hover-shine">
            <h1 className="text-primary display-6 brand-title">Ray Dazzle</h1>
            <p className="text-muted mb-0 brand-subtitle" style={{ fontSize: '0.8rem', marginTop: '-8px' }}>Products that elude luxury</p>
          </Link>
          <button 
            className="navbar-toggler py-2 px-3" 
            type="button"
            aria-controls="navbarCollapse"
            aria-expanded={navOpen ? 'true' : 'false'}
            aria-label="Toggle navigation"
            onClick={() => setNavOpen(o => !o)}
          >
            <span className="fa fa-bars text-primary"></span>
          </button>
          <div className={`collapse navbar-collapse bg-white ${navOpen ? 'show' : ''}`} id="navbarCollapse">
            <div className="navbar-nav mx-auto nav-underline">
              <NavLink to="/" end className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`} onClick={() => setNavOpen(false)}>Home</NavLink>
              <div className="nav-item dropdown">
                <NavLink to="/shop" className={({ isActive }) => `nav-link dropdown-toggle ${isActive ? 'active' : ''}`} role="button" data-bs-toggle="dropdown" aria-expanded="false" onClick={() => setNavOpen(false)}>
                  Shop
                </NavLink>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/shop" onClick={() => setNavOpen(false)}>All Products</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  {categories.slice(0, 8).map(cat => (
                    <li key={cat._id}>
                      <Link className="dropdown-item" to={`/shop?category=${cat._id}`} onClick={() => setNavOpen(false)}>
                        {cat.name} {typeof cat.productCount === 'number' ? `(${cat.productCount})` : ''}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <NavLink to="/about" className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`} onClick={() => setNavOpen(false)}>About</NavLink>
              <NavLink to="/testimonial" className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`} onClick={() => setNavOpen(false)}>Testimonials</NavLink>
              <NavLink to="/contact" className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`} onClick={() => setNavOpen(false)}>Contact</NavLink>
              <NavLink to="/faq" className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`} onClick={() => setNavOpen(false)}>FAQs</NavLink>
              {isAuthenticated && isAdmin && (
                <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-item nav-link ${isActive ? 'active' : ''}`} onClick={() => setNavOpen(false)}>Admin</NavLink>
              )}
            </div>
            <div className="d-flex m-3 me-0 align-items-center gap-2 gap-lg-3">
              <button 
                className="btn-search btn border border-secondary btn-md-square rounded-circle bg-white me-2 me-lg-4 btn-glow" 
                type="button"
                onClick={() => setSearchOpen(true)}
              >
                <i className="fas fa-search text-primary"></i>
              </button>
              <Link to="/cart" className="position-relative me-2 me-lg-4 my-auto" onClick={() => setNavOpen(false)}>
                <i className="fa fa-shopping-bag fa-2x"></i>
                {getCartCount() > 0 && (
                  <span className="position-absolute bg-secondary rounded-circle d-flex align-items-center justify-content-center text-dark px-1" 
                        style={{ top: '-5px', left: '15px', height: '20px', minWidth: '20px' }}>
                    {getCartCount()}
                  </span>
                )}
              </Link>
              {/* Customer quick logout button on navbar (visible, not in dropdown) */}
              {isAuthenticated && !isAdmin && (
                <button
                  onClick={handleLogout}
                  className="btn border border-secondary rounded-pill px-3 text-primary me-3 my-auto btn-glow"
                  type="button"
                  title="Logout"
                >
                  <i className="fas fa-sign-out-alt me-2 text-primary"></i> Logout
                </button>
              )}
              {isAuthenticated ? (
                <div className="dropdown">
                  <button 
                    className="btn border border-secondary rounded-pill px-3 text-primary" 
                    type="button" 
                    id="userDropdown" 
                    data-bs-toggle="dropdown"
                  >
                    <i className="fas fa-user me-2 text-primary"></i> {user?.name}
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="userDropdown">
                    <li><Link className="dropdown-item" to="/profile" onClick={() => setNavOpen(false)}>Profile</Link></li>
                    <li><Link className="dropdown-item" to="/orders" onClick={() => setNavOpen(false)}>My Orders</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link to="/login" className="btn border border-secondary rounded-pill px-3 text-primary btn-glow" onClick={() => setNavOpen(false)}>
                    <i className="fas fa-user me-2 text-primary"></i> Login
                  </Link>
                  <Link to="/register" className="btn btn-primary rounded-pill px-3 text-white btn-glow" onClick={() => setNavOpen(false)}>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Search Overlay (React-controlled) */}
      {searchOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search">
          <div className="search-backdrop" onClick={() => setSearchOpen(false)} />
          <div className="search-panel" role="document">
            <div className="search-header">
              <h6 className="mb-0">Search products</h6>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="search-body">
              <form onSubmit={handleSearch} className="search-form">
                <div className="input-group input-group-lg search-input">
                  <span className="input-group-text"><i className="fa fa-search"></i></span>
                  <input 
                    type="search" 
                    className="form-control"
                    placeholder="Search by name, brand, category"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">Search</button>
                </div>
              </form>
              <div className="search-hints">
                <small className="text-muted">Try: "sweet", "floral", "Tom Ford", "gift"</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
