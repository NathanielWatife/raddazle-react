import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import AnimatedSection from '../components/AnimatedSection';
import ProductCard from '../components/ProductCard';
import { productService } from '../services';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const toast = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll({ limit: 8 });
      setProducts(response.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product._id, 1);
      toast.success('Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  return (
    <Layout>
      {/* Hero Start */}
      <AnimatedSection className="container-fluid py-5 mb-5 hero-header" animationClass="animate-fade-up">
        <div className="container py-5">
          <div className="row g-5 align-items-center">
            <div className="col-md-12 col-lg-7">
              <h4 className="mb-3 text-secondary">100% Authentic</h4>
              <h1 className="mb-5 display-3 text-primary">
                Luxury Scents
              </h1>
              <div className="position-relative mx-auto">
                <input 
                  className="form-control border-2 border-secondary w-75 py-3 px-4 rounded-pill" 
                  type="text" 
                  placeholder="Search products"
                />
                <button 
                  type="submit" 
                  className="btn btn-primary border-2 border-secondary py-3 px-4 position-absolute rounded-pill text-white h-100 btn-glow" 
                  style={{ top: 0, right: '25%' }}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
      {/* Hero End */}

      {/* Featurs Section Start */}
      <AnimatedSection className="container-fluid featurs py-5" animationClass="animate-fade-up">
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-md-6 col-lg-3">
              <div className="featurs-item text-center rounded bg-light p-4 hover-lift">
                <div className="featurs-icon btn-square rounded-circle bg-secondary mb-5 mx-auto">
                  <i className="fas fa-car-side fa-3x text-white"></i>
                </div>
                <div className="featurs-content text-center">
                  <h5>Shipping Availability</h5>
                  <p className="mb-0">Ship to preferred Location</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="featurs-item text-center rounded bg-light p-4 hover-lift">
                <div className="featurs-icon btn-square rounded-circle bg-secondary mb-5 mx-auto">
                  <i className="fas fa-user-shield fa-3x text-white"></i>
                </div>
                <div className="featurs-content text-center">
                  <h5>Security Payment</h5>
                  <p className="mb-0">100% security payment</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="featurs-item text-center rounded bg-light p-4 hover-lift">
                <div className="featurs-icon btn-square rounded-circle bg-secondary mb-5 mx-auto">
                  <i className="fas fa-exchange-alt fa-3x text-white"></i>
                </div>
                <div className="featurs-content text-center">
                  <h5>30 Day Return</h5>
                  <p className="mb-0">30 day money guarantee</p>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="featurs-item text-center rounded bg-light p-4 hover-lift">
                <div className="featurs-icon btn-square rounded-circle bg-secondary mb-5 mx-auto">
                  <i className="fa fa-phone-alt fa-3x text-white"></i>
                </div>
                <div className="featurs-content text-center">
                  <h5>24/7 Support</h5>
                  <p className="mb-0">Support every time fast</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
      {/* Featurs Section End */}

      {/* Fruits Shop Start */}
      <AnimatedSection className="container-fluid fruite py-5" animationClass="animate-fade-up">
        <div className="container py-5">
          <div className="tab-class text-center">
            <div className="row g-4">
              <div className="col-lg-4 text-start">
                <h1>Our Luxury Fragrances</h1>
              </div>
              <div className="col-lg-8 text-end">
                <ul className="nav nav-pills d-inline-flex text-center mb-5">
                  <li className="nav-item">
                    <a className="d-flex m-2 py-2 bg-light rounded-pill active" data-bs-toggle="pill" href="#tab-1">
                      <span className="text-dark" style={{ width: '130px' }}>All Products</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="tab-content">
              <div id="tab-1" className="tab-pane fade show p-0 active">
                <div className="row g-4">
                  {loading ? (
                    <div className="col-12 text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    products.map((product) => (
                      <ProductCard 
                        key={product._id} 
                        product={product} 
                        onAddToCart={handleAddToCart}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
      {/* Fruits Shop End */}
    </Layout>
  );
};

export default Home;
