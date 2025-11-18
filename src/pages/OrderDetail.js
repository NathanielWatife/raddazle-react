import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { orderService } from '../services';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderService.getById(id);
      setOrder(response.order);
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to load order.';
      toast.error(message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const fmt = (value) => formatCurrency(value);

  const handleMockPayment = async () => {
    if (!order || order.isPaid) return;
    setProcessing(true);
    try {
      const paymentData = {
        id: `PAY-${Date.now()}`,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: user?.email,
      };
      const response = await orderService.pay(order._id, paymentData);
      toast.success('Payment recorded successfully.');
      setOrder(response.order);
    } catch (err) {
      const message = err.response?.data?.message || 'Payment failed. Please try again.';
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!order || order.status === 'cancelled' || order.isDelivered) return;
    const ok = await confirm({ title: 'Cancel this order?', message: 'This action cannot be undone.', variant: 'danger', okText: 'Cancel order' });
    if (!ok) return;
    setProcessing(true);
    try {
      const response = await orderService.cancel(order._id);
      setOrder(response.order);
      toast.success('Order cancelled.');
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to cancel order.';
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container py-5" style={{ marginTop: '120px' }}>
          <p className="text-muted mb-3">Order not found.</p>
          <Link to="/orders" className="btn btn-outline-primary">Back to orders</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6">Order Details</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item"><a href="/orders">Orders</a></li>
          <li className="breadcrumb-item active text-white">Details</li>
        </ol>
      </div>
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1">Order #{order._id.slice(-6)}</h1>
            <p className="text-muted mb-0">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <Link to="/orders" className="btn btn-outline-secondary">Back to orders</Link>
        </div>

        

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="mb-3">Shipping Information</h5>
                <p className="mb-1 fw-semibold">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                <p className="mb-1">{order.shippingAddress?.address}</p>
                <p className="mb-1">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p className="mb-1">{order.shippingAddress?.country} • {order.shippingAddress?.postalCode}</p>
                <p className="mb-0">Phone: {order.shippingAddress?.mobile || 'N/A'}</p>
              </div>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="mb-3">Order Items</h5>
                {order.orderItems?.map((item) => (
                  <div className="d-flex align-items-center justify-content-between border-bottom py-3 order-item" key={item.product}>
                    <div className="d-flex align-items-center">
                      <img
                        src={item.image || '/img/vegetable-item-1.jpg'}
                        alt={item.name}
                        className="rounded"
                        style={{ width: 64, height: 64, objectFit: 'cover' }}
                      />
                      <div className="ms-3">
                        <p className="mb-1 fw-semibold line-clamp-1" style={{ maxWidth: 200 }}>{item.name}</p>
                        <small className="text-muted">Qty {item.quantity}</small>
                      </div>
                    </div>
                    <p className="mb-0 fw-semibold order-item-price">{fmt(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="mb-3">Payment</h5>
                <p className="mb-1">Method: {order.paymentMethod}</p>
                <p className="mb-1">
                  Status:{' '}
                  {order.isPaid ? <span className="badge bg-success">Paid</span> : <span className="badge bg-warning text-dark">Pending</span>}
                </p>
                {order.isPaid && order.paidAt && (
                  <small className="text-muted">Paid at {new Date(order.paidAt).toLocaleString()}</small>
                )}
                {!order.isPaid && (
                  <button
                    className="btn btn-primary w-100 w-xs-100 mt-3"
                    onClick={handleMockPayment}
                    disabled={processing}
                  >
                    {processing ? 'Processing…' : 'Pay Now'}
                  </button>
                )}
              </div>
            </div>

            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h5 className="mb-3">Order Summary</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span>Items</span>
                  <span>{fmt(order.itemsPrice)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax</span>
                  <span>{fmt(order.taxPrice)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span>{fmt(order.shippingPrice)}</span>
                </div>
                <div className="d-flex justify-content-between border-top pt-2 fw-bold">
                  <span>Total</span>
                  <span>{fmt(order.totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="mb-3">Status</h5>
                <p className="mb-2">Current: {order.status}</p>
                <p className="mb-3">
                  Delivery:{' '}
                  {order.isDelivered ? (
                    <span className="badge bg-success">Delivered</span>
                  ) : (
                    <span className="badge bg-secondary">In transit</span>
                  )}
                </p>
                {!order.isDelivered && order.status !== 'cancelled' && (
                  <button
                    className="btn btn-outline-danger w-100 w-xs-100"
                    onClick={handleCancel}
                    disabled={processing}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetail;
