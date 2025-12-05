import React from 'react';
import AnimatedSection from './AnimatedSection';
import { formatCurrency } from '../utils/currency';
import { getImageUrl } from '../services/api';

const ProductCard = ({ product, onAddToCart }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  // Get the proper image URL
  const imageUrl = getImageUrl(product.image);

  return (
    <AnimatedSection className="col-12 col-md-6 col-lg-4 col-xl-3" animationClass="animate-fade-up">
      <div className="rounded position-relative fruite-item hover-lift hover-shine">
        <div className="fruite-img">
          <img 
            src={imageUrl || '/img/product-placeholder.jpg'} 
            className="img-fluid w-100 rounded-top" 
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/img/product-placeholder.jpg';
            }}
          />
        </div>
        <div className="text-white bg-secondary px-3 py-1 rounded position-absolute" 
             style={{ top: '10px', left: '10px' }}>
          {product.category?.name}
        </div>
        <div className="p-4 border border-secondary border-top-0 rounded-bottom">
          <h4 className="line-clamp-1">{product.name}</h4>
          <p className="text-muted mb-1 line-clamp-1">{product.brand}</p>
          <p className="line-clamp-2">{product.description}</p>
          <div className="d-flex justify-content-between flex-lg-wrap">
            <p className="text-dark fs-5 fw-bold mb-0">
              {formatCurrency(product.price)}
            </p>
            <button 
              onClick={handleAddToCart}
              className="btn btn-primary btn-glow rounded-pill px-3"
            >
              <i className="fa fa-shopping-bag me-2"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default ProductCard;
