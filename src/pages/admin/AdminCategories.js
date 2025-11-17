import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { categoryService, uploadService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const PAGE_SIZE = 10;

const AdminCategories = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
    const confirm = useConfirm();
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [count, setCount] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image: '', isActive: true });
  const [uploading, setUploading] = useState(false);

  const fetchData = async (opts = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: PAGE_SIZE, includeCounts: true };
      if (search?.trim()) params.search = search.trim();
      if (opts.page) params.page = opts.page;
      const res = await categoryService.getAll(params);
      setItems(res.categories || []);
      setPage(res.page || 1);
      setPages(res.pages || 1);
      setCount(res.count || (res.categories || []).length);
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      setError('');
      toast.error(msg || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', image: '', isActive: true });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name || '', description: cat.description || '', image: cat.image || '', isActive: !!cat.isActive });
    setModalOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) await categoryService.update(editing._id, form);
      else await categoryService.create(form);
      setModalOpen(false);
      setEditing(null);
      await fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    }
  };

  const onToggleActive = async (cat) => {
    try {
      await categoryService.update(cat._id, { isActive: !cat.isActive });
      await fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update');
    }
  };

  const onDelete = async (cat) => {
    const ok = await confirm.confirm({
      variant: 'danger',
      title: 'Delete Category',
      message: `Are you sure you want to delete "${cat.name}"? This cannot be undone.`,
      okText: 'Delete',
      cancelText: 'Cancel'
    });
    if (!ok) return;
    try {
      await categoryService.remove(cat._id);
      await fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete');
    }
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.info('Please select an image'); return; }
    try {
      setUploading(true);
      const res = await uploadService.uploadImage(file);
      const url = res.url || res.imageUrl || res.path || '';
      if (!url) throw new Error('No URL from upload');
      setForm(prev => ({ ...prev, image: url }));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const onSearchSubmit = async (e) => {
    e.preventDefault();
    setPage(1);
    await fetchData({ page: 1 });
  };

  const canPrev = page > 1;
  const canNext = page < pages;

  return (
    <AdminLayout title="Categories">
      <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center justify-content-between mb-3">
        <form className="d-flex gap-2" onSubmit={onSearchSubmit}>
          <input className="form-control" placeholder="Search categories..." value={search} onChange={(e)=>setSearch(e.target.value)} />
          <button className="btn btn-outline-secondary" type="submit"><i className="fas fa-search"></i></button>
        </form>
        <button className="btn btn-primary btn-sm" onClick={openCreate}><i className="fas fa-plus me-1"></i>New Category</button>
      </div>

      {/* Errors shown via overlay toasts */}

      <div className="table-responsive">
        <table className="table table-striped table-sm">
          <thead>
            <tr>
              <th>Name</th>
              <th className="col-optional">Products</th>
              <th className="col-optional">Status</th>
              <th className="col-optional">Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-4"><div className="spinner-border" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="5" className="text-center">No categories found</td></tr>
            ) : (
              items.map(c => (
                <tr key={c._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {c.image && <img src={c.image} alt="" style={{ width: 32, height: 24, objectFit: 'cover', borderRadius: 3 }} />}
                      <div>
                        <div className="fw-semibold">{c.name}</div>
                        <small className="text-muted d-block col-optional">{c.description}</small>
                      </div>
                    </div>
                  </td>
                  <td className="col-optional">{c.productCount ?? '-'}</td>
                  <td className="col-optional"><span className={`badge bg-${c.isActive ? 'success' : 'secondary'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="col-optional">{new Date(c.updatedAt).toLocaleString()}</td>
                  <td>
                    <div className="d-none d-md-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(c)}><i className="fas fa-edit"></i></button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => onToggleActive(c)}>{c.isActive ? 'Deactivate' : 'Activate'}</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(c)}><i className="fas fa-trash"></i></button>
                    </div>
                    <div className="dropdown d-md-none">
                      <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Actions</button>
                      <ul className="dropdown-menu">
                        <li><button className="dropdown-item" onClick={() => openEdit(c)}><i className="fas fa-edit me-2"></i>Edit</button></li>
                        <li><button className="dropdown-item" onClick={() => onToggleActive(c)}>{c.isActive ? 'Deactivate' : 'Activate'}</button></li>
                        <li><button className="dropdown-item text-danger" onClick={() => onDelete(c)}><i className="fas fa-trash me-2"></i>Delete</button></li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-2">
        <div className="small text-muted">{count} total</div>
        <div className="btn-group">
          <button className="btn btn-sm btn-outline-secondary" disabled={!canPrev} onClick={() => { if (canPrev) { setPage(page-1); fetchData({ page: page-1 }); } }}>Prev</button>
          <button className="btn btn-sm btn-outline-secondary" disabled={!canNext} onClick={() => { if (canNext) { setPage(page+1); fetchData({ page: page+1 }); } }}>Next</button>
        </div>
      </div>

      {modalOpen && (
        <>
          <div className="adm-modal-backdrop" onClick={() => setModalOpen(false)} />
          <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="catFormTitle">
            <div className="adm-modal-header">
              <h6 id="catFormTitle" className="mb-0">{editing ? 'Edit Category' : 'New Category'}</h6>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setModalOpen(false)} aria-label="Close"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={onSave}>
              <div className="adm-modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea rows="3" className="form-control" value={form.description} onChange={(e)=>setForm({ ...form, description: e.target.value })} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Image</label>
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                      <input type="file" accept="image/*" className="form-control" onChange={onUpload} disabled={uploading} />
                      {uploading && <span className="small text-muted">Uploading...</span>}
                    </div>
                    <small className="text-muted">Or paste an image URL.</small>
                    <input className="form-control mt-2" placeholder="https://..." value={form.image} onChange={(e)=>setForm({ ...form, image: e.target.value })} />
                    {form.image && (
                      <div className="mt-2">
                        <img src={form.image} alt="Category" style={{ maxWidth: '120px', maxHeight: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                      </div>
                    )}
                  </div>
                  <div className="col-12 form-check">
                    <input id="catActive2" type="checkbox" className="form-check-input" checked={form.isActive} onChange={(e)=>setForm({ ...form, isActive: e.target.checked })} />
                    <label htmlFor="catActive2" className="form-check-label">Active</label>
                  </div>
                </div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-sm btn-primary">Save</button>
              </div>
            </form>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
