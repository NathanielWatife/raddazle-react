import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService, categoryService, uploadService } from '../../services';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState('');
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', image: '', isActive: true });
  const [catUploading, setCatUploading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchDashboard();
    fetchCategories();
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

  const fetchCategories = async () => {
    setCatLoading(true);
    setCatError('');
    try {
      const res = await categoryService.getAll();
      setCategories(res.categories || []);
    } catch (e) {
      setCatError(e.response?.data?.message || e.message);
    } finally {
      setCatLoading(false);
    }
  };

  const openCreateCategory = () => {
    setEditingCat(null);
    setCatForm({ name: '', description: '', image: '', isActive: true });
    setCatModalOpen(true);
  };

  const openEditCategory = (cat) => {
    setEditingCat(cat);
    setCatForm({
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || '',
      isActive: !!cat.isActive,
    });
    setCatModalOpen(true);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await categoryService.update(editingCat._id, catForm);
      } else {
        await categoryService.create(catForm);
      }
      setCatModalOpen(false);
      setEditingCat(null);
      await fetchCategories();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save category');
    }
  };

  const onUploadCategoryImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    try {
      setCatUploading(true);
      const res = await uploadService.uploadImage(file);
      // Expecting { url } or { imageUrl }
      const url = res.url || res.imageUrl || res.path || '';
      if (!url) throw new Error('Upload failed: no URL returned');
      setCatForm(prev => ({ ...prev, image: url }));
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Image upload failed');
    } finally {
      setCatUploading(false);
      // reset the input value to allow same file reselect
      e.target.value = '';
    }
  };

  const toggleActive = async (cat) => {
    try {
      await categoryService.update(cat._id, { isActive: !cat.isActive });
      await fetchCategories();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update category');
    }
  };

  const deleteCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await categoryService.remove(cat._id);
      await fetchCategories();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete category');
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

      {/* Categories */}
      <div className="d-flex justify-content-between align-items-center mt-2 mb-2">
        <h2 className="mb-0">Categories</h2>
        <button className="btn btn-sm btn-primary" onClick={openCreateCategory}><i className="fas fa-plus me-1"></i>Add Category</button>
      </div>
      {catError && <div className="alert alert-danger">{catError}</div>}
      <div className="table-responsive">
        <table className="table table-striped table-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th className="col-optional">Status</th>
              <th className="col-optional">Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {catLoading ? (
              <tr><td colSpan="4" className="text-center py-4"><div className="spinner-border" /></td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="4" className="text-center">No categories found</td></tr>
            ) : (
              categories.map(c => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td className="col-optional">
                    <span className={`badge bg-${c.isActive ? 'success' : 'secondary'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="col-optional">{new Date(c.updatedAt).toLocaleString()}</td>
                  <td>
                    <div className="d-none d-md-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => openEditCategory(c)}><i className="fas fa-edit"></i></button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleActive(c)}>{c.isActive ? 'Deactivate' : 'Activate'}</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCategory(c)}><i className="fas fa-trash"></i></button>
                    </div>
                    <div className="dropdown d-md-none">
                      <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Actions</button>
                      <ul className="dropdown-menu">
                        <li><button className="dropdown-item" onClick={() => openEditCategory(c)}><i className="fas fa-edit me-2"></i>Edit</button></li>
                        <li><button className="dropdown-item" onClick={() => toggleActive(c)}>{c.isActive ? 'Deactivate' : 'Activate'}</button></li>
                        <li><button className="dropdown-item text-danger" onClick={() => deleteCategory(c)}><i className="fas fa-trash me-2"></i>Delete</button></li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Category Modal */}
      {catModalOpen && (
        <>
          <div className="adm-modal-backdrop" onClick={() => setCatModalOpen(false)} />
          <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="catModalTitle">
            <div className="adm-modal-header">
              <h6 id="catModalTitle" className="mb-0">{editingCat ? 'Edit Category' : 'Add Category'}</h6>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setCatModalOpen(false)} aria-label="Close"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={saveCategory}>
              <div className="adm-modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={catForm.name} onChange={(e)=>setCatForm({...catForm, name: e.target.value})} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="3" value={catForm.description} onChange={(e)=>setCatForm({...catForm, description: e.target.value})} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Image</label>
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                      <input type="file" accept="image/*" className="form-control" onChange={onUploadCategoryImage} disabled={catUploading} />
                      {catUploading && <span className="small text-muted">Uploading...</span>}
                    </div>
                    <small className="text-muted">You can also paste an image URL below.</small>
                    <input className="form-control mt-2" placeholder="https://..." value={catForm.image} onChange={(e)=>setCatForm({...catForm, image: e.target.value})} />
                    {catForm.image && (
                      <div className="mt-2">
                        <img src={catForm.image} alt="Category" style={{ maxWidth: '120px', maxHeight: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                      </div>
                    )}
                  </div>
                  <div className="col-12 form-check">
                    <input id="catActive" type="checkbox" className="form-check-input" checked={catForm.isActive} onChange={(e)=>setCatForm({...catForm, isActive: e.target.checked})} />
                    <label htmlFor="catActive" className="form-check-label">Active</label>
                  </div>
                </div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setCatModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm btn-primary">Save</button>
              </div>
            </form>
          </div>
        </>
      )}

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
