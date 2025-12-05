import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService, categoryService, uploadService } from '../../services';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
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
  const toast = useToast();
  const confirm = useConfirm();

  const fetchDashboard = useCallback(async () => {
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
  }, [navigate]);

  const fetchCategories = useCallback(async () => {
    setCatLoading(true);
    setCatError('');
    try {
      const res = await categoryService.getAll();
      setCategories(res.categories || []);
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      setCatError(msg);
      toast.error(msg);
    } finally {
      setCatLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchDashboard();
    fetchCategories();
  }, [isAdmin, navigate, fetchDashboard, fetchCategories]);

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
      toast.success('Category saved.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save category');
    }
  };

  const onUploadCategoryImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
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
      toast.error(err.response?.data?.message || err.message || 'Image upload failed');
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
      toast.success('Category updated.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update category');
    }
  };

  const deleteCategory = async (cat) => {
    const ok = await confirm.confirm({ title: 'Delete category?', message: `Delete "${cat.name}" permanently?`, variant: 'danger', okText: 'Delete' });
    if (!ok) return;
    try {
      await categoryService.remove(cat._id);
      await fetchCategories();
      toast.success('Category deleted.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete category');
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
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleString() : '-';
  };

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card bg-primary text-white h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-title text-uppercase small mb-2 opacity-90">Total Users</h6>
                      <h2 className="mb-1 fw-bold">{stats?.users?.totalUsers || 0}</h2>
                      <small className="opacity-75">Active: {stats?.users?.activeUsers || 0}</small>
                    </div>
                    <i className="fas fa-users fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card bg-success text-white h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-title text-uppercase small mb-2 opacity-90">Total Products</h6>
                      <h2 className="mb-1 fw-bold">{stats?.products?.totalProducts || 0}</h2>
                      <small className="opacity-75">In Stock</small>
                    </div>
                    <i className="fas fa-box fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card bg-warning text-white h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-title text-uppercase small mb-2 opacity-90">Total Orders</h6>
                      <h2 className="mb-1 fw-bold">{stats?.orders?.totalOrders || 0}</h2>
                      <small className="opacity-75">All time</small>
                    </div>
                    <i className="fas fa-shopping-cart fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card bg-info text-white h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="card-title text-uppercase small mb-2 opacity-90">Revenue</h6>
                      <h2 className="mb-1 fw-bold fs-4">{formatCurrency(stats?.orders?.totalRevenue || 0)}</h2>
                      <small className="opacity-75">Total</small>
                    </div>
                    <i className="fas fa-dollar-sign fa-2x opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Categories */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h2 className="mb-0 h4">Categories</h2>
        <button className="btn btn-sm btn-primary" onClick={openCreateCategory}>
          <i className="fas fa-plus me-1"></i>
          <span className="d-none d-sm-inline">Add Category</span>
          <span className="d-inline d-sm-none">Add</span>
        </button>
      </div>
      {catError && <div className="alert alert-danger alert-sm">{catError}</div>}
      <div className="table-responsive">
        <table className="table table-striped table-sm table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th className="col-optional d-none d-md-table-cell">Status</th>
              <th className="col-optional d-none d-lg-table-cell">Updated</th>
              <th style={{width: '120px'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {catLoading ? (
              <tr><td colSpan="4" className="text-center py-4">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="4" className="text-center text-muted py-3">No categories found</td></tr>
            ) : (
              categories.map(c => (
                <tr key={c._id}>
                  <td className="fw-medium">{c.name}</td>
                  <td className="col-optional d-none d-md-table-cell">
                    <span className={`badge bg-${c.isActive ? 'success' : 'secondary'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="col-optional d-none d-lg-table-cell">
                    <small className="text-muted">{new Date(c.updatedAt).toLocaleString()}</small>
                  </td>
                  <td>
                    <div className="d-none d-md-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => openEditCategory(c)} title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleActive(c)} title={c.isActive ? 'Deactivate' : 'Activate'}>
                        <i className={`fas fa-${c.isActive ? 'toggle-on' : 'toggle-off'}`}></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCategory(c)} title="Delete">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    <div className="dropdown d-md-none">
                      <button className="btn btn-sm btn-outline-secondary dropdown-toggle w-100" data-bs-toggle="dropdown" aria-expanded="false">
                        <i className="fas fa-ellipsis-v"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <button className="dropdown-item" onClick={() => openEditCategory(c)}>
                            <i className="fas fa-edit me-2"></i>Edit
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item" onClick={() => toggleActive(c)}>
                            <i className={`fas fa-${c.isActive ? 'toggle-off' : 'toggle-on'} me-2`}></i>
                            {c.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button className="dropdown-item text-danger" onClick={() => deleteCategory(c)}>
                            <i className="fas fa-trash me-2"></i>Delete
                          </button>
                        </li>
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
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 mt-4">
        <h2 className="mb-0 h4">Recent Orders</h2>
        <Link to="/admin/orders" className="btn btn-sm btn-outline-primary">
          <span className="d-none d-sm-inline">View All Orders</span>
          <span className="d-inline d-sm-none">View All</span>
          <i className="fas fa-arrow-right ms-1"></i>
        </Link>
      </div>
      <div className="table-responsive">
            <table className="table table-striped table-sm table-hover">
              <thead>
                <tr>
                  <th style={{width: '100px'}}>Order ID</th>
                  <th className="d-none d-md-table-cell">Customer</th>
                  <th>Status</th>
                  <th className="text-end">Total</th>
                  <th className="d-none d-lg-table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.orders?.recentOrders && stats.orders.recentOrders.length > 0 ? (
                  stats.orders.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="text-truncate" style={{ maxWidth: '100px' }}>
                        <small className="font-monospace">#{order._id.slice(-8)}</small>
                      </td>
                      <td className="d-none d-md-table-cell">
                        <span className="text-truncate d-inline-block" style={{maxWidth: '150px'}}>
                          {order.user?.name || order.user?.email || '-'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${
                          order.status === 'delivered' ? 'success' : 
                          order.status === 'pending' ? 'warning text-dark' : 
                          order.status === 'cancelled' ? 'danger' :
                          'info'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="fw-bold text-end">{formatCurrency(order.totalPrice)}</td>
                      <td className="d-none d-lg-table-cell">
                        <small className="text-muted">{formatDate(order.createdAt)}</small>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      <i className="fas fa-inbox fa-2x mb-2 d-block opacity-50"></i>
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
