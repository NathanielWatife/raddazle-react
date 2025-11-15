import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { orderService } from '../services';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      setOrders(response.orders || []);
      setError('');
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to load your orders.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

  return (
    <Layout>
      <div className="container py-5" style={{ marginTop: '120px' }}>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="h3 mb-1">My Orders</h1>
            <p className="text-muted mb-0">Track your recent purchases and their fulfillment status.</p>
          </div>
          <button className="btn btn-outline-secondary" onClick={fetchOrders} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading…</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5">
            <p className="mb-3">You have no orders yet.</p>
            <Link to="/shop" className="btn btn-primary rounded-pill px-4">Start Shopping</Link>
          </div>
        ) : (
          <div className="table-responsive shadow-sm rounded bg-white">
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
                    <td>{formatCurrency(order.totalPrice || order.itemsPrice)}</td>
                    <td className="col-optional">
                      {order.isPaid ? (
                        <span className="badge bg-success">Paid</span>
                      ) : (
                        <span className="badge bg-warning text-dark">Pending</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/orders/${order._id}`} className="btn btn-sm btn-outline-primary rounded-pill w-xs-100">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
