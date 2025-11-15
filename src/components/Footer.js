import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <>
      {/* Footer Start */}
      <div className="container-fluid bg-dark text-white-50 footer pt-5 mt-5">
        <div className="container py-5">
          <div className="pb-4 mb-4" style={{ borderBottom: '1px solid rgba(226, 175, 24, 0.5)' }}>
            <div className="row g-4">
              <div className="col-lg-3">
                <Link to="/">
                  <h1 className="text-primary mb-0">Raddazle</h1>
                  <p className="text-secondary mb-0">Fresh products</p>
                </Link>
              </div>
              <div className="col-lg-6">
                <div className="position-relative mx-auto">
                  <input 
                    className="form-control border-0 w-100 py-3 px-4 rounded-pill" 
                    type="email" 
                    placeholder="Your Email"
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary border-0 border-secondary py-3 px-4 position-absolute rounded-pill text-white" 
                    style={{ top: 0, right: 0 }}
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
              <div className="col-lg-3">
                <div className="d-flex justify-content-end pt-3">
                  <a className="btn btn-outline-secondary me-2 btn-md-square rounded-circle" href="#">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a className="btn btn-outline-secondary me-2 btn-md-square rounded-circle" href="#">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a className="btn btn-outline-secondary me-2 btn-md-square rounded-circle" href="#">
                    <i className="fab fa-youtube"></i>
                  </a>
                  <a className="btn btn-outline-secondary btn-md-square rounded-circle" href="#">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="row g-5">
            <div className="col-lg-3 col-md-6">
              <div className="footer-item">
                <h4 className="text-light mb-3">Why Choose Raddazle?</h4>
                <p className="mb-4">
                  Authentic luxury fragrances at unbeatable prices. From designer perfumes to niche scents. 
                  100% genuine products guaranteed!
                </p>
                <Link to="/shop" className="btn border-secondary py-2 px-4 rounded-pill text-primary">
                  Shop Now
                </Link>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="d-flex flex-column text-start footer-item">
                <h4 className="text-light mb-3">Shop Info</h4>
                <Link className="btn-link" to="/about">About Us</Link>
                <Link className="btn-link" to="/contact">Contact Us</Link>
                <Link className="btn-link" to="/privacy">Privacy Policy</Link>
                <Link className="btn-link" to="/terms">Terms & Condition</Link>
                <Link className="btn-link" to="/return">Return Policy</Link>
                <Link className="btn-link" to="/faq">FAQs & Help</Link>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="d-flex flex-column text-start footer-item">
                <h4 className="text-light mb-3">Account</h4>
                <Link className="btn-link" to="/profile">My Account</Link>
                <Link className="btn-link" to="/shop">Shop details</Link>
                <Link className="btn-link" to="/cart">Shopping Cart</Link>
                <Link className="btn-link" to="/wishlist">Wishlist</Link>
                <Link className="btn-link" to="/orders">Order History</Link>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="footer-item">
                <h4 className="text-light mb-3">Contact</h4>
                <p>Address: 1429 Netus Rd, NY 48247</p>
                <p>Email: Example@gmail.com</p>
                <p>Phone: +0123 4567 8910</p>
                <p>Payment Accepted</p>
                <img src="/img/payment.png" className="img-fluid" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer End */}

      {/* Copyright Start */}
      <div className="container-fluid copyright bg-dark py-4">
        <div className="container">
          <div className="row">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              <span className="text-light">
                <Link to="/" className="text-primary">
                  <i className="fas fa-copyright text-primary me-2"></i>Raddazle
                </Link>
                , All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Copyright End */}

      {/* Back to Top */}
      <a href="#" className="btn btn-primary border-3 border-primary rounded-circle back-to-top">
        <i className="fa fa-arrow-up"></i>
      </a>
    </>
  );
};

export default Footer;
