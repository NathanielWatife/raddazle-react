import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { productService, uploadService, categoryService } from '../../services';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const emptyForm = { name: '', price: '', brand: '', category: '', image: '', description: '', countInStock: 0, isFeatured: false };

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  // pagination total pages not currently displayed; track current page only
  const [keyword, setKeyword] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [bulkDelta, setBulkDelta] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const toast = useToast();
  const confirm = useConfirm();

  const fetchProducts = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await productService.getAll({ page: p, pageSize: 10, keyword });
      setProducts(res.products || []);
      setPage(res.page || 1);
      // pages count is not displayed in UI currently
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getAll();
        setCategories(res.categories || []);
      } catch (e) {
        // non-fatal for page; keep input usable
        console.error('Failed to load categories', e);
      }
    };
    loadCategories();
  }, []);

  const onSearch = async (e) => {
    e.preventDefault();
    await fetchProducts(1);
  };

  const onEdit = (prod) => {
    setEditingId(prod._id);
    setForm({
      name: prod.name || '',
      price: prod.price || '',
      brand: prod.brand || '',
      category: prod.category?._id || prod.category || '',
      image: prod.image || '',
      description: prod.description || '',
      countInStock: prod.countInStock || 0,
      isFeatured: !!prod.isFeatured
    });
    setFormOpen(true);
  };

  const onCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const onDelete = async (id) => {
    const ok = await confirm({ title: 'Delete product?', message: 'This action cannot be undone.', variant: 'danger', okText: 'Delete' });
    if (!ok) return;
    try {
      await productService.delete(id);
      await fetchProducts(page);
      toast.success('Product deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      countInStock: Number(form.countInStock)
    };
    if (editingId) {
      await productService.update(editingId, payload);
    } else {
      await productService.create(payload);
    }
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    await fetchProducts(page);
    toast.success('Product saved.');
  };

  const onImageSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadService.uploadImage(file);
      const url = res.url || res.path;
      if (url) {
        setForm((prev) => ({ ...prev, image: url }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelected(products.map(p => p._id));
    else setSelected([]);
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const onBulkAdjust = async () => {
    const delta = parseInt(bulkDelta, 10);
    if (!delta || selected.length === 0) return;
    const ok = await confirm({ title: 'Adjust inventory?', message: `Adjust stock by ${delta} for ${selected.length} product(s)?`, variant: 'warning', okText: 'Apply' });
    if (!ok) return;
    for (const id of selected) {
      await productService.adjustInventory(id, { delta, reason: 'manual-adjustment', note: 'Bulk update' });
    }
    setSelected([]);
    setBulkDelta(0);
    await fetchProducts(page);
    toast.success('Inventory adjusted.');
  };

  return (
    <AdminLayout title="Products">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <form className="d-flex gap-2" onSubmit={onSearch}>
          <input className="form-control" placeholder="Search products..." value={keyword} onChange={(e)=>setKeyword(e.target.value)} />
          <button className="btn btn-outline-secondary" type="submit">Search</button>
        </form>
        <div className="d-flex gap-2">
          <div className="input-group input-group-sm" style={{ width: 220 }}>
            <span className="input-group-text">Bulk Δ</span>
            <input type="number" className="form-control" value={bulkDelta} onChange={(e)=>setBulkDelta(e.target.value)} />
            <button className="btn btn-outline-primary" type="button" onClick={onBulkAdjust}>Apply</button>
          </div>
          <button className="btn btn-primary" onClick={onCreate}><i className="fas fa-plus me-1"></i>Add Product</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" /></div>
      ) : error ? (
        <p className="text-danger small">{error}</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-sm">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" onChange={toggleSelectAll} checked={selected.length === products.length && products.length>0} />
                </th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="col-optional">Brand</th>
                <th className="col-optional">Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    <input type="checkbox" checked={selected.includes(p._id)} onChange={()=>toggleSelect(p._id)} />
                  </td>
                  <td>{p.name}</td>
                  <td>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(p.price) || 0)}</td>
                  <td>{p.countInStock}</td>
                  <td className="col-optional">{p.brand}</td>
                  <td className="col-optional">{p.isFeatured ? 'Yes' : 'No'}</td>
                  <td>
                    {/* Desktop/tablet actions */}
                    <div className="d-none d-md-flex gap-2 flex-wrap">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(p)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(p._id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                      <Link className="btn btn-sm btn-outline-secondary" to={`/admin/products/${p._id}/inventory`}>
                        Inventory
                      </Link>
                    </div>
                    {/* Mobile actions dropdown */}
                    <div className="dropdown d-md-none">
                      <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        Actions
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button className="dropdown-item" onClick={() => onEdit(p)}>
                            <i className="fas fa-edit me-2"></i>Edit
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item text-danger" onClick={() => onDelete(p._id)}>
                            <i className="fas fa-trash me-2"></i>Delete
                          </button>
                        </li>
                        <li>
                          <Link className="dropdown-item" to={`/admin/products/${p._id}/inventory`}>
                            <i className="fas fa-boxes me-2"></i>Inventory
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <div className="card mt-3">
          <div className="card-body">
            <h5 className="card-title mb-3">{editingId ? 'Edit Product' : 'Add Product'}</h5>
            <form className="row g-3" onSubmit={onSave}>
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input className="form-control" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Price</label>
                <input type="number" step="0.01" className="form-control" value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Stock</label>
                <input type="number" className="form-control" value={form.countInStock} onChange={(e)=>setForm({...form,countInStock:e.target.value})} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Brand</label>
                <input className="form-control" value={form.brand} onChange={(e)=>setForm({...form,brand:e.target.value})} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={(e)=>setForm({...form, category: e.target.value})} required>
                  <option value="" disabled>-- Select category --</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Product Image</label>
                <input type="file" accept="image/*" className="form-control" onChange={onImageSelect} />
                {uploading && <small className="text-muted">Uploading...</small>}
                {form.image && (
                  <div className="mt-2 img-preview-box">
                    <button type="button" className="btn-close" aria-label="Remove image" onClick={() => setForm(prev => ({...prev, image: ''}))}></button>
                    <img src={form.image} alt="preview" />
                  </div>
                )}
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="3" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} required />
              </div>
              <div className="col-12 form-check">
                <input type="checkbox" className="form-check-input" id="isFeatured" checked={form.isFeatured} onChange={(e)=>setForm({...form,isFeatured:e.target.checked})} />
                <label className="form-check-label" htmlFor="isFeatured">Featured</label>
              </div>
              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary" type="submit">Save</button>
                <button className="btn btn-outline-secondary" type="button" onClick={()=>{setFormOpen(false); setEditingId(null); setForm(emptyForm);}}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
