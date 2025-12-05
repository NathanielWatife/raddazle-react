import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import AnimatedSection from '../components/AnimatedSection';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { getImageUrl } from '../services/api';
import { orderService, paymentService, userService } from '../services';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    country: '',
    mobile: '',
    email: '',
    paymentMethod: 'cod',
    bankRef: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [bankInfo, setBankInfo] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const paystackPublicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
  const flwPublicKey = process.env.REACT_APP_FLW_PUBLIC_KEY;

  // Load user profile and saved addresses
  const loadUserProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const profile = await userService.getProfile();
      const userData = profile.user || profile;
      
      // Get shipping addresses
      const shippingAddresses = userData.shippingAddress || [];
      setSavedAddresses(shippingAddresses);
      
      // Find default address or use the first one
      const defaultAddress = shippingAddresses.find(addr => addr.isDefault) || shippingAddresses[0];
      
      // Pre-fill form with user data and default address
      setFormData(prev => ({
        ...prev,
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        email: userData.email || '',
        mobile: userData.phoneNumber || '',
        ...(defaultAddress ? {
          address: defaultAddress.street || '',
          city: defaultAddress.city || '',
          state: defaultAddress.state || '',
          country: defaultAddress.country || ''
        } : {})
      }));
      
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      } else {
        setUseNewAddress(true);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUseNewAddress(true);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    // Fetch bank info for display if bank-transfer is chosen
    const loadBank = async () => {
      try {
        const res = await paymentService.getBankInfo();
        setBankInfo(res.bank);
      } catch { }
    };
    loadBank();
  }, []);

  const handleAddressSelect = (addressId) => {
    const address = savedAddresses.find(a => a._id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setUseNewAddress(false);
      setFormData(prev => ({
        ...prev,
        address: address.street || '',
        city: address.city || '',
        state: address.state || '',
        country: address.country || ''
      }));
    }
  };

  const handleUseNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
    setFormData(prev => ({
      ...prev,
      address: '',
      city: '',
      state: '',
      country: ''
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderPaymentMethod = formData.paymentMethod === 'paystack' ? 'card' : formData.paymentMethod;
      const orderData = {
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          mobile: formData.mobile
        },
        paymentMethod: orderPaymentMethod
      };

      const orderRes = await orderService.create(orderData);
      const order = orderRes?.order || orderRes?.data?.order || orderRes;

      if (formData.paymentMethod === 'cod') {
        await clearCart();
        toast.success('Order placed successfully!');
        navigate('/orders');
        return;
      }

      if (formData.paymentMethod === 'paystack') {
        const init = await paymentService.initPaystack(order._id);
        const ref = init.reference;
        if (window.PaystackPop && paystackPublicKey) {
          const handler = window.PaystackPop.setup({
            key: paystackPublicKey,
            email: init.email,
            amount: Math.round((init.amount || 0) * 100),
            ref,
            currency: 'NGN',
            callback: async function () {
              try {
                await paymentService.verifyPaystack(ref, order._id);
                await clearCart();
                toast.success('Payment successful!');
                navigate('/orders');
              } catch (err) {
                toast.error(err.response?.data?.message || err.message || 'Verification failed');
              }
            },
            onClose: function () {
              toast.info('Payment window closed. You can try again from Orders.');
              navigate('/orders');
            }
          });
          handler.openIframe();
        } else if (init.authorizationUrl) {
          window.location.href = init.authorizationUrl;
        } else {
          toast.error('Unable to start Paystack payment.');
        }
        return;
      }

      if (formData.paymentMethod === 'bank-transfer') {
        await paymentService.submitBankTransfer({ orderId: order._id, reference: formData.bankRef || `BANK_${order._id}` });
        await clearCart();
        toast.info('Order placed. Awaiting bank transfer verification.');
        navigate('/orders');
        return;
      }

      if (formData.paymentMethod === 'flutterwave') {
        const init = await paymentService.initFlutterwave(order._id);
        const txRef = init.txRef;
        if (window.FlutterwaveCheckout && flwPublicKey) {
          window.FlutterwaveCheckout({
            public_key: flwPublicKey,
            tx_ref: txRef,
            amount: init.amount,
            currency: init.currency || 'NGN',
            payment_options: 'card,banktransfer,ussd',
            customer: {
              email: init.customer?.email,
              name: init.customer?.name,
            },
            callback: async function (data) {
              try {
                await paymentService.verifyFlutterwave(txRef);
                await clearCart();
                toast.success('Payment successful!');
                navigate('/orders');
              } catch (err) {
                toast.error(err.response?.data?.message || err.message || 'Verification failed');
              }
            },
            onclose: function () {
              toast.info('Payment window closed. You can try again from Orders.');
              navigate('/orders');
            },
          });
        } else {
          toast.error('Unable to start Flutterwave payment.');
        }
        return;
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Layout>
      <AnimatedSection className="container-fluid page-header py-5" animationClass="animate-fade-up">
        <h1 className="text-center text-white display-6">Checkout</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item"><a href="/cart">Cart</a></li>
          <li className="breadcrumb-item active text-white">Checkout</li>
        </ol>
      </AnimatedSection>
      {/* Checkout Page Start */}
      <AnimatedSection className="container-fluid py-5" animationClass="animate-fade-up">
        <div className="container py-5">
          <h1 className="mb-4">Billing details</h1>
          
          {loadingProfile ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading your saved information...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row g-5">
                <div className="col-md-12 col-lg-6 col-xl-7">
                  {/* Saved Addresses Section */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-4 p-3 border rounded bg-light">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">
                          <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                          Shipping Address
                        </h5>
                      </div>
                      <div className="row g-2">
                        {savedAddresses.map((addr) => (
                          <div key={addr._id} className="col-12">
                            <div 
                              className={`p-3 border rounded ${selectedAddressId === addr._id && !useNewAddress ? 'border-primary bg-white shadow-sm' : 'bg-white'}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleAddressSelect(addr._id)}
                            >
                              <div className="d-flex align-items-start">
                                <input 
                                  type="radio" 
                                  className="form-check-input mt-1 me-3" 
                                  checked={selectedAddressId === addr._id && !useNewAddress}
                                  onChange={() => handleAddressSelect(addr._id)}
                                  name="savedAddress"
                                />
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                      <p className="mb-1 fw-semibold">{addr.street}</p>
                                      <p className="mb-0 text-muted small">
                                        {addr.city}, {addr.state} {addr.postalCode}
                                      </p>
                                      <p className="mb-0 text-muted small">{addr.country}</p>
                                    </div>
                                    {addr.isDefault && (
                                      <span className="badge bg-primary">Default</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {/* Option to add new address */}
                        <div className="col-12">
                          <div 
                            className={`p-3 border rounded ${useNewAddress ? 'border-primary bg-white shadow-sm' : 'bg-white'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={handleUseNewAddress}
                          >
                            <div className="d-flex align-items-center">
                              <input 
                                type="radio" 
                                className="form-check-input me-3" 
                                checked={useNewAddress}
                                onChange={handleUseNewAddress}
                                name="savedAddress"
                              />
                              <div>
                                <p className="mb-0 fw-semibold">
                                  <i className="fas fa-plus me-2 text-primary"></i>
                                  Use a different address
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show address form if no saved addresses or using new address */}
                  {(savedAddresses.length === 0 || useNewAddress) && (
                    <div className={savedAddresses.length > 0 ? 'p-3 border rounded bg-light mb-4' : ''}>
                      {savedAddresses.length > 0 && (
                        <h6 className="mb-3 text-muted">
                          <i className="fas fa-pencil-alt me-2"></i>
                          Enter shipping address
                        </h6>
                      )}
                      <div className="form-item">
                        <label className="form-label my-3">Address <sup>*</sup></label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="House Number Street Name"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-item">
                        <label className="form-label my-3">Town/City<sup>*</sup></label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-item">
                        <label className="form-label my-3">Country<sup>*</sup></label>
                        <input
                          type="text"
                          className="form-control"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-item">
                        <label className="form-label my-3">State/Province<sup>*</sup></label>
                        <input
                          type="text"
                          className="form-control"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Customer Information */}
                  <div className="row">
                    <div className="col-md-12 col-lg-6">
                      <div className="form-item w-100">
                        <label className="form-label my-3">First Name<sup>*</sup></label>
                        <input
                          type="text"
                          className="form-control"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-12 col-lg-6">
                      <div className="form-item w-100">
                        <label className="form-label my-3">Last Name<sup>*</sup></label>
                        <input
                          type="text"
                          className="form-control"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-item">
                    <label className="form-label my-3">Mobile<sup>*</sup></label>
                    <input
                      type="tel"
                      className="form-control"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-item">
                    <label className="form-label my-3">Email Address<sup>*</sup></label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-12 col-lg-6 col-xl-5">
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th scope="col">Products</th>
                          <th scope="col">Name</th>
                          <th scope="col">Price</th>
                          <th scope="col">Quantity</th>
                          <th scope="col">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.items.map((item) => (
                          <tr key={item.product._id}>
                            <th scope="row">
                              <div className="d-flex align-items-center mt-2">
                                <img
                                  src={getImageUrl(item.product.image) || '/img/product-placeholder.jpg'}
                                  className="img-fluid rounded-circle"
                                  style={{ width: '90px', height: '90px', objectFit: 'cover' }}
                                  alt={item.product.name}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/img/product-placeholder.jpg';
                                  }}
                                />
                              </div>
                            </th>
                            <td className="py-5">{item.product.name}</td>
                            <td className="py-5">{formatCurrency(item.product.price)}</td>
                            <td className="py-5">{item.quantity}</td>
                            <td className="py-5">{formatCurrency(item.product.price * item.quantity)}</td>
                          </tr>
                        ))}
                        <tr>
                          <th scope="row"></th>
                          <td className="py-5"></td>
                          <td className="py-5"></td>
                          <td className="py-5">
                            <p className="mb-0 text-dark py-3">Subtotal</p>
                          </td>
                          <td className="py-5">
                            <div className="py-3 border-bottom border-top">
                              <p className="mb-0 text-dark">{formatCurrency(getCartTotal())}</p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row"></th>
                          <td className="py-5">
                            <p className="mb-0 text-dark py-4">Shipping</p>
                          </td>
                          <td colSpan="3" className="py-5">
                            <div className="form-check text-start">
                              <input
                                type="checkbox"
                                className="form-check-input bg-primary border-0"
                                id="Shipping-1"
                                name="Shipping-1"
                                defaultChecked
                              />
                              <label className="form-check-label" htmlFor="Shipping-1">
                                Free Shipping
                              </label>
                            </div>
                            <div className="form-check text-start">
                              <input
                                type="checkbox"
                                className="form-check-input bg-primary border-0"
                                id="Shipping-2"
                                name="Shipping-2"
                              />
                              <label className="form-check-label" htmlFor="Shipping-2">
                                Flat rate: {formatCurrency(15)}
                              </label>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th scope="row"></th>
                          <td className="py-5">
                            <p className="mb-0 text-dark text-uppercase py-3">TOTAL</p>
                          </td>
                          <td className="py-5"></td>
                          <td className="py-5"></td>
                          <td className="py-5">
                            <div className="py-3 border-bottom border-top">
                              <p className="mb-0 text-dark">{formatCurrency(getCartTotal())}</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="row g-4 text-start justify-content-center border-bottom py-3">
                    <div className="col-12">
                      <h5 className="mb-3">Payment Method</h5>
                      <div className="form-check my-2">
                        <input type="radio" className="form-check-input bg-primary border-0" id="pm-cod" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} />
                        <label className="form-check-label" htmlFor="pm-cod">Cash on Delivery</label>
                      </div>
                      <div className="form-check my-2">
                        <input type="radio" className="form-check-input bg-primary border-0" id="pm-paystack" name="paymentMethod" value="paystack" checked={formData.paymentMethod === 'paystack'} onChange={handleChange} />
                        <label className="form-check-label" htmlFor="pm-paystack">Paystack (Card, Bank, USSD)</label>
                      </div>
                      <div className="form-check my-2">
                        <input type="radio" className="form-check-input bg-primary border-0" id="pm-bank" name="paymentMethod" value="bank-transfer" checked={formData.paymentMethod === 'bank-transfer'} onChange={handleChange} />
                        <label className="form-check-label" htmlFor="pm-bank">Bank Transfer</label>
                      </div>
                    </div>
                    {formData.paymentMethod === 'bank-transfer' && (
                      <div className="col-12">
                        <div className="p-3 border rounded bg-dark-subtle">
                          <p className="mb-1"><strong>Bank:</strong> {bankInfo?.bankName || '-'}</p>
                          <p className="mb-1"><strong>Account Name:</strong> {bankInfo?.accountName || '-'}</p>
                          <p className="mb-1"><strong>Account Number:</strong> {bankInfo?.accountNumber || '-'}</p>
                          <p className="mb-2 small text-muted">{bankInfo?.instructions || 'Use your Order ID as payment reference.'}</p>
                          <div className="row g-2">
                            <div className="col-12 col-md-6">
                              <label className="form-label">Transfer Reference</label>
                              <input className="form-control" name="bankRef" value={formData.bankRef} onChange={handleChange} placeholder="e.g. Mobile app reference" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="row g-4 text-center align-items-center justify-content-center pt-4">
                    <button
                      type="submit"
                      className="btn btn-primary py-3 px-4 text-uppercase w-100 btn-glow"
                      disabled={loading}
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </AnimatedSection>
      {/* Checkout Page End */}
    </Layout>
  );
};

export default Checkout;
