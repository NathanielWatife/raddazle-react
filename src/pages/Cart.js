import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import AnimatedSection from '../components/AnimatedSection';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update cart:', error);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Layout>
        <AnimatedSection className="container-fluid py-5" animationClass="animate-fade-up">
          <div className="container py-5">
            <div className="text-center">
              <h2>Your cart is empty</h2>
              <button 
                onClick={() => navigate('/shop')}
                className="btn btn-primary rounded-pill px-4 py-3 mt-4 btn-glow"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </AnimatedSection>
      </Layout>
    );
  }

  return (
    <Layout>
      <AnimatedSection className="container-fluid page-header py-5" animationClass="animate-fade-up">
        <h1 className="text-center text-white display-6">Your Cart</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item active text-white">Cart</li>
        </ol>
      </AnimatedSection>
      {/* Cart Page Start */}
      <AnimatedSection className="container-fluid py-5" animationClass="animate-fade-up">
        <div className="container py-5">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Products</th>
                  <th scope="col">Name</th>
                  <th scope="col">Price</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Total</th>
                  <th scope="col">Handle</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <tr key={item._id}>
                    <td data-label="Product">
                      <div className="d-flex align-items-center justify-content-center">
                        <img 
                          src={item.product.image || '/img/vegetable-item-3.png'} 
                          className="img-fluid rounded-circle" 
                          style={{ width: '80px', height: '80px' }} 
                          alt={item.product.name}
                        />
                      </div>
                    </td>
                    <td data-label="Name">
                      <p className="mb-0 mt-4 mt-md-0">{item.product.name}</p>
                    </td>
                    <td data-label="Price">
                      <p className="mb-0 mt-4 mt-md-0">{formatCurrency(item.product.price)}</p>
                    </td>
                    <td data-label="Quantity">
                      <div className="input-group quantity mt-4 mt-md-0" style={{ width: '100px' }}>
                        <div className="input-group-btn">
                          <button 
                            className="btn btn-sm btn-minus rounded-circle bg-light border"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <i className="fa fa-minus"></i>
                          </button>
                        </div>
                        <input 
                          type="text" 
                          className="form-control form-control-sm text-center border-0" 
                          value={item.quantity}
                          readOnly
                          aria-label="Quantity"
                        />
                        <div className="input-group-btn">
                          <button 
                            className="btn btn-sm btn-plus rounded-circle bg-light border"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <i className="fa fa-plus"></i>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td data-label="Total">
                      <p className="mb-0 mt-4 mt-md-0">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </td>
                    <td data-label="Remove">
                      <button 
                        className="btn btn-md rounded-circle bg-light border mt-4 mt-md-0"
                        onClick={() => handleRemove(item._id)}
                        aria-label="Remove item from cart"
                      >
                        <i className="fa fa-times text-danger"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 coupon-section d-flex flex-wrap align-items-center gap-3">
            <input 
              type="text" 
              className="border-0 border-bottom rounded py-3 flex-grow-1" 
              placeholder="Coupon Code"
              style={{ minWidth: '200px' }}
            />
            <button 
              className="btn btn-primary rounded-pill px-4 py-3 btn-glow" 
              type="button"
            >
              Apply Coupon
            </button>
          </div>
          <div className="row g-4 justify-content-end">
            <div className="col-12 col-md-8 col-lg-6 col-xl-4">
              <div className="bg-light rounded">
                <div className="p-4">
                  <h1 className="display-6 mb-4">Cart <span className="fw-normal">Total</span></h1>
                  <div className="d-flex justify-content-between mb-4">
                    <h5 className="mb-0 me-4">Subtotal:</h5>
                    <p className="mb-0">{formatCurrency(getCartTotal())}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <h5 className="mb-0 me-4">Shipping</h5>
                    <div>
                      <p className="mb-0">Flat rate: {formatCurrency(3)}</p>
                    </div>
                  </div>
                  <p className="mb-0 text-end">Shipping to Nigeria.</p>
                </div>
                <div className="py-4 mb-4 border-top border-bottom d-flex justify-content-between">
                  <h5 className="mb-0 ps-4 me-4">Total</h5>
                  <p className="mb-0 pe-4">{formatCurrency(getCartTotal() + 3)}</p>
                </div>
                <button 
                  className="btn btn-primary rounded-pill px-4 py-3 text-uppercase mb-4 ms-4 btn-glow" 
                  type="button"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
      {/* Cart Page End */}
    </Layout>
  );
};

export default Cart;
