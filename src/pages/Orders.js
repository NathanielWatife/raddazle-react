import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import AnimatedSection from '../components/AnimatedSection';
import { orderService, paymentService } from '../services';
import { formatCurrency } from '../utils/currency';
import { useToast } from '../context/ToastContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      setOrders(response.orders || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to load your orders.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Use shared NGN formatter
  const fmt = (value) => formatCurrency(value);
  const paystackPublicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
  const flwPublicKey = process.env.REACT_APP_FLW_PUBLIC_KEY;

  const payWithPaystack = async (order) => {
    try {
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
            try { await paymentService.verifyPaystack(ref, order._id); await fetchOrders(); toast.success('Payment successful!'); } catch (err) { toast.error(err.response?.data?.message || err.message || 'Verification failed'); }
          },
          onClose: function() { /* no-op */ },
        });
        handler.openIframe();
      } else if (init.authorizationUrl) {
        window.location.href = init.authorizationUrl;
      } else {
        toast.error('Unable to start Paystack payment.');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Could not start payment');
    }
  };

  const payWithFlutterwave = async (order) => {
    try {
      const init = await paymentService.initFlutterwave(order._id);
      const txRef = init.txRef;
      if (window.FlutterwaveCheckout && flwPublicKey) {
        window.FlutterwaveCheckout({
          public_key: flwPublicKey,
          tx_ref: txRef,
          amount: init.amount,
          currency: init.currency || 'NGN',
          payment_options: 'card,banktransfer,ussd',
          customer: { email: init.customer?.email, name: init.customer?.name },
          callback: async function() {
            try { await paymentService.verifyFlutterwave(txRef); await fetchOrders(); toast.success('Payment successful!'); } catch (err) { toast.error(err.response?.data?.message || err.message || 'Verification failed'); }
          },
          onclose: function() { /* no-op */ },
        });
      } else {
        toast.error('Unable to start Flutterwave payment.');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Could not start payment');
    }
  };

  return (
    <Layout>
      <AnimatedSection className="container-fluid page-header py-5" animationClass="animate-fade-up">
        <h1 className="text-center text-white display-6">My Orders</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item active text-white">Orders</li>
        </ol>
      </AnimatedSection>
      <AnimatedSection className="container py-5" animationClass="animate-fade-up">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="h3 mb-1">My Orders</h1>
            <p className="text-muted mb-0">Track your recent purchases and their fulfillment status.</p>
          </div>
          <button className="btn btn-outline-secondary btn-glow" onClick={fetchOrders} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading…</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5">
            <p className="mb-3">You have no orders yet.</p>
            <Link to="/shop" className="btn btn-primary rounded-pill px-4 btn-glow">Start Shopping</Link>
          </div>
        ) : (
          <div className="table-responsive shadow-sm rounded bg-white hover-lift">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order</th>
                  <th className="col-optional">Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th className="col-optional">Payment</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="fw-semibold">#{order._id.slice(-6)}</td>
                    <td className="col-optional">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge text-uppercase ${order.status === 'delivered' ? 'bg-success' : order.status === 'cancelled' ? 'bg-danger' : 'bg-secondary'}`}>
                        {order.status || (order.isDelivered ? 'delivered' : 'processing')}
                      </span>
                    </td>
                    <td>{fmt(order.totalPrice || order.itemsPrice)}</td>
                    <td className="col-optional">
                      {order.isPaid ? (
                        <span className="badge bg-success">Paid</span>
                      ) : (
                        <span className="badge bg-warning text-dark">Pending</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <Link to={`/orders/${order._id}`} className="btn btn-sm btn-outline-primary rounded-pill w-xs-100">View Details</Link>
                        {!order.isPaid && (
                          <>
                            {paystackPublicKey && (
                              <button className="btn btn-sm btn-primary rounded-pill w-xs-100 btn-glow" onClick={() => payWithPaystack(order)}>Pay with Paystack</button>
                            )}
                            {flwPublicKey && (
                              <button className="btn btn-sm btn-success rounded-pill w-xs-100 btn-glow" onClick={() => payWithFlutterwave(order)}>Pay with Flutterwave</button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AnimatedSection>
    </Layout>
  );
};

export default Orders;
