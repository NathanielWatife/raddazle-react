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
                  <h1 className="text-primary mb-0">Ray Dazzle</h1>
                  <p className="text-secondary mb-0">Products that elude luxury</p>
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
                    className="btn btn-primary border-0 border-secondary py-3 px-4 position-absolute rounded-pill text-white btn-glow" 
                    style={{ top: 0, right: 0 }}
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
              <div className="col-lg-3">
                <div className="d-flex justify-content-end pt-3">
                  <a className="btn btn-outline-secondary me-2 btn-md-square rounded-circle btn-glow" href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a className="btn btn-outline-secondary me-2 btn-md-square rounded-circle btn-glow" href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a className="btn btn-outline-secondary me-2 btn-md-square rounded-circle btn-glow" href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                    <i className="fab fa-youtube"></i>
                  </a>
                  <a className="btn btn-outline-secondary btn-md-square rounded-circle btn-glow" href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
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
                  Every product is made with safe, efficent and reliable ingredents that deliver results. Our brand consistently delivers convenience, confidence and cleanliness.
                </p>
                <Link to="/shop" className="btn border-secondary py-2 px-4 rounded-pill text-primary hover-shine btn-glow">
                  Shop Now
                </Link>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="d-flex flex-column text-start footer-item">
                <h4 className="text-light mb-3">Shop Info</h4>
                <Link className="btn-link" to="/about">About Us</Link>
                <Link className="btn-link" to="/faq">FAQs &amp; Help</Link>
                <Link className="btn-link" to="/contact">Contact Us</Link>
                <Link className="btn-link" to="/terms">Terms &amp; Conditions</Link>
                <Link className="btn-link" to="/privacy">Privacy Policy</Link>
                <Link className="btn-link" to="/return">Returns &amp; Refunds</Link>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="d-flex flex-column text-start footer-item">
                <h4 className="text-light mb-3">Account</h4>
                <Link className="btn-link" to="/profile">My Account</Link>
                <Link className="btn-link" to="/shop">Shop Details</Link>
                <Link className="btn-link" to="/cart">Shopping Cart</Link>
                <Link className="btn-link" to="/checkout">Checkout</Link>
                <Link className="btn-link" to="/orders">Order History</Link>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="footer-item">
                <h4 className="text-light mb-3">Contact</h4>
                <p>Address: Lagos, Nigeria</p>
                <p>Email: support@raddazle.com</p>
                <p>Phone: +234 800 000 0000</p>
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
                  <i className="fas fa-copyright text-primary me-2"></i>Ray Dazzle
                </Link>
                , All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Copyright End */}

      {/* Back to Top */}
      <button
        type="button"
        className="btn btn-primary border-3 border-primary rounded-circle back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <i className="fa fa-arrow-up"></i>
      </button>
    </>
  );
};

export default Footer;
