import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';

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
        <div className="container-fluid py-5">
          <div className="container py-5">
            <div className="text-center">
              <h2>Your cart is empty</h2>
              <button 
                onClick={() => navigate('/shop')}
                className="btn border-secondary rounded-pill px-4 py-3 text-primary mt-4"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Cart Page Start */}
      <div className="container-fluid py-5">
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
                    <th scope="row">
                      <div className="d-flex align-items-center">
                        <img 
                          src={item.product.image || '/img/vegetable-item-3.png'} 
                          className="img-fluid me-5 rounded-circle" 
                          style={{ width: '80px', height: '80px' }} 
                          alt={item.product.name}
                        />
                      </div>
                    </th>
                    <td>
                      <p className="mb-0 mt-4">{item.product.name}</p>
                    </td>
                    <td>
                      <p className="mb-0 mt-4">${item.product.price.toFixed(2)}</p>
                    </td>
                    <td>
                      <div className="input-group quantity mt-4" style={{ width: '100px' }}>
                        <div className="input-group-btn">
                          <button 
                            className="btn btn-sm btn-minus rounded-circle bg-light border"
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          >
                            <i className="fa fa-minus"></i>
                          </button>
                        </div>
                        <input 
                          type="text" 
                          className="form-control form-control-sm text-center border-0" 
                          value={item.quantity}
                          readOnly
                        />
                        <div className="input-group-btn">
                          <button 
                            className="btn btn-sm btn-plus rounded-circle bg-light border"
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          >
                            <i className="fa fa-plus"></i>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="mb-0 mt-4">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </td>
                    <td>
                      <button 
                        className="btn btn-md rounded-circle bg-light border mt-4"
                        onClick={() => handleRemove(item._id)}
                      >
                        <i className="fa fa-times text-danger"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5">
            <input 
              type="text" 
              className="border-0 border-bottom rounded me-5 py-3 mb-4" 
              placeholder="Coupon Code"
            />
            <button 
              className="btn border-secondary rounded-pill px-4 py-3 text-primary" 
              type="button"
            >
              Apply Coupon
            </button>
          </div>
          <div className="row g-4 justify-content-end">
            <div className="col-8"></div>
            <div className="col-sm-8 col-md-7 col-lg-6 col-xl-4">
              <div className="bg-light rounded">
                <div className="p-4">
                  <h1 className="display-6 mb-4">Cart <span className="fw-normal">Total</span></h1>
                  <div className="d-flex justify-content-between mb-4">
                    <h5 className="mb-0 me-4">Subtotal:</h5>
                    <p className="mb-0">${getCartTotal().toFixed(2)}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <h5 className="mb-0 me-4">Shipping</h5>
                    <div>
                      <p className="mb-0">Flat rate: $3.00</p>
                    </div>
                  </div>
                  <p className="mb-0 text-end">Shipping to Nigeria.</p>
                </div>
                <div className="py-4 mb-4 border-top border-bottom d-flex justify-content-between">
                  <h5 className="mb-0 ps-4 me-4">Total</h5>
                  <p className="mb-0 pe-4">${(getCartTotal() + 3).toFixed(2)}</p>
                </div>
                <button 
                  className="btn border-secondary rounded-pill px-4 py-3 text-primary text-uppercase mb-4 ms-4" 
                  type="button"
                  onClick={handleCheckout}
                >
                  Proceed Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Cart Page End */}
    </Layout>
  );
};

export default Cart;
