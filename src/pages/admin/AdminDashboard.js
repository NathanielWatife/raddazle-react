import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchDashboard();
  }, [isAdmin, navigate]);

  const fetchDashboard = async () => {
    try {
      const response = await adminService.getDashboard();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleString() : '-';
  };

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Users</h5>
                  <h2>{stats?.users?.totalUsers || 0}</h2>
                  <small>Active: {stats?.users?.activeUsers || 0}</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Products</h5>
                  <h2>{stats?.products?.totalProducts || 0}</h2>
                  <small>In Stock</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Orders</h5>
                  <h2>{stats?.orders?.totalOrders || 0}</h2>
                  <small>All time</small>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h5 className="card-title">Revenue</h5>
                  <h2>{formatCurrency(stats?.orders?.totalRevenue || 0)}</h2>
                  <small>Total</small>
                </div>
              </div>
            </div>
          </div>

      {/* Recent Orders Table */}
      <h2 className="mb-3">Recent Orders</h2>
      <div className="table-responsive">
            <table className="table table-striped table-sm">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.orders?.recentOrders && stats.orders.recentOrders.length > 0 ? (
                  stats.orders.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>{order._id}</td>
                      <td>{order.user?.name || order.user?.email || '-'}</td>
                      <td>
                        <span className={`badge bg-${order.status === 'delivered' ? 'success' : 'warning'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{formatCurrency(order.totalPrice)}</td>
                      <td>{formatDate(order.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No recent orders</td>
                  </tr>
                )}
              </tbody>
            </table>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
