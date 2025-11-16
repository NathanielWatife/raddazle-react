import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { orderService, paymentService, uploadService } from '../services';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postcode: '',
    mobile: '',
    email: '',
    paymentMethod: 'cod',
    bankRef: '',
    bankProofImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [bankInfo, setBankInfo] = useState(null);
  const paystackPublicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
  const flwPublicKey = process.env.REACT_APP_FLW_PUBLIC_KEY;

  useEffect(() => {
    // Fetch bank info for display if bank-transfer is chosen
    const loadBank = async () => {
      try {
        const res = await paymentService.getBankInfo();
        setBankInfo(res.bank);
      } catch {}
    };
    loadBank();
  }, []);

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
          postalCode: formData.postcode,
          mobile: formData.mobile
        },
        paymentMethod: orderPaymentMethod
      };

      const orderRes = await orderService.create(orderData);
      const order = orderRes?.order || orderRes?.data?.order || orderRes;

      if (formData.paymentMethod === 'cod') {
        await clearCart();
        alert('Order placed successfully!');
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
            callback: async function() {
              try {
                await paymentService.verifyPaystack(ref, order._id);
                await clearCart();
                alert('Payment successful!');
                navigate('/orders');
              } catch (err) {
                alert(err.response?.data?.message || err.message || 'Verification failed');
              }
            },
            onClose: function() {
              alert('Payment window closed. You can try again from Orders page.');
              navigate('/orders');
            }
          });
          handler.openIframe();
        } else if (init.authorizationUrl) {
          window.location.href = init.authorizationUrl;
        } else {
          alert('Unable to start Paystack payment.');
        }
        return;
      }

      if (formData.paymentMethod === 'bank-transfer') {
        // Optional: upload proof image first if provided
        let proofImageUrl = '';
        if (formData.bankProofImage instanceof File) {
          const up = await uploadService.uploadImage(formData.bankProofImage);
          proofImageUrl = up.url || up.imageUrl || up.path || '';
        }
        await paymentService.submitBankTransfer({ orderId: order._id, reference: formData.bankRef || `BANK_${order._id}`, proofImageUrl });
        await clearCart();
        alert('Order placed. Awaiting payment verification.');
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
            callback: async function(data) {
              try {
                await paymentService.verifyFlutterwave(txRef);
                await clearCart();
                alert('Payment successful!');
                navigate('/orders');
              } catch (err) {
                alert(err.response?.data?.message || err.message || 'Verification failed');
              }
            },
            onclose: function() {
              alert('Payment window closed. You can try again from Orders page.');
              navigate('/orders');
            },
          });
        } else {
          alert('Unable to start Flutterwave payment.');
        }
        return;
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to place order. Please try again.');
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
      {/* Checkout Page Start */}
      <div className="container-fluid py-5">
        <div className="container py-5">
          <h1 className="mb-4">Billing details</h1>
          <form onSubmit={handleSubmit}>
            <div className="row g-5">
              <div className="col-md-12 col-lg-6 col-xl-7">
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
                  <label className="form-label my-3">Company Name<sup>*</sup></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>
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
                <div className="form-item">
                  <label className="form-label my-3">Postcode/Zip<sup>*</sup></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="postcode"
                    value={formData.postcode}
                    onChange={handleChange}
                    required
                  />
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
                                src={item.product.image || '/img/vegetable-item-2.jpg'} 
                                className="img-fluid rounded-circle" 
                                style={{ width: '90px', height: '90px' }} 
                                alt=""
                              />
                            </div>
                          </th>
                          <td className="py-5">{item.product.name}</td>
                          <td className="py-5">${item.product.price.toFixed(2)}</td>
                          <td className="py-5">{item.quantity}</td>
                          <td className="py-5">${(item.product.price * item.quantity).toFixed(2)}</td>
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
                            <p className="mb-0 text-dark">${getCartTotal().toFixed(2)}</p>
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
                              Flat rate: $15.00
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
                            <p className="mb-0 text-dark">${getCartTotal().toFixed(2)}</p>
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
                          <div className="col-12 col-md-6">
                            <label className="form-label">Upload Proof (optional)</label>
                            <input className="form-control" type="file" accept="image/*" onChange={(e)=>{
                              const file = e.target.files?.[0];
                              setFormData(prev=>({ ...prev, bankProofImage: file || '' }));
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="row g-4 text-center align-items-center justify-content-center pt-4">
                  <button 
                    type="submit" 
                    className="btn border-secondary py-3 px-4 text-uppercase w-100 text-primary"
                    disabled={loading}
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* Checkout Page End */}
    </Layout>
  );
};

export default Checkout;
