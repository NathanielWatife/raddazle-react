import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, onAddToCart }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="col-12 col-md-6 col-lg-4 col-xl-3">
      <div className="rounded position-relative fruite-item">
        <div className="fruite-img">
          <img 
            src={product.image || '/img/fruite-item-1.jpg'} 
            className="img-fluid w-100 rounded-top" 
            alt={product.name}
          />
        </div>
        <div className="text-white bg-secondary px-3 py-1 rounded position-absolute" 
             style={{ top: '10px', left: '10px' }}>
          {product.category?.name || 'Fruits'}
        </div>
        <div className="p-4 border border-secondary border-top-0 rounded-bottom">
          <h4 className="line-clamp-1">{product.name}</h4>
          <p className="text-muted mb-1 line-clamp-1">{product.brand}</p>
          <p className="line-clamp-2">{product.description}</p>
          <div className="d-flex justify-content-between flex-lg-wrap">
            <p className="text-dark fs-5 fw-bold mb-0">
              ${product.price?.toFixed(2)}
            </p>
            <button 
              onClick={handleAddToCart}
              className="btn border border-secondary rounded-pill px-3 text-primary"
            >
              <i className="fa fa-shopping-bag me-2 text-primary"></i> Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
