import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '../../services';
import ProtectedRoute from '../../components/ProtectedRoute';
import AdminRoute from '../../components/AdminRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';

const InventoryInner = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ delta: 0, reason: 'manual-adjustment', note: '' });
  const toast = useToast();

  const fetchAll = async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const [pRes, hRes] = await Promise.all([
        productService.getById(id),
        productService.getInventoryHistory(id, { page: p, pageSize: 10 })
      ]);
      setProduct(pRes.product);
      setHistory(hRes.history);
      setPage(hRes.page);
      setPages(hRes.pages);
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(1); }, [id]);

  const onAdjust = async (e) => {
    e.preventDefault();
    await productService.adjustInventory(id, { ...form, delta: parseInt(form.delta, 10) });
    setForm({ delta: 0, reason: 'manual-adjustment', note: '' });
    await fetchAll(page);
  };

  if (loading) return <AdminLayout title="Inventory"><div className="text-center py-5"><div className="spinner-border"/></div></AdminLayout>;
  if (error) return <AdminLayout title="Inventory"><p className="text-danger small">{error}</p></AdminLayout>;
  if (!product) return <AdminLayout title="Inventory"><div>Product not found</div></AdminLayout>;

  return (
    <AdminLayout title={`Inventory: ${product.name}`}>
      <div className="mb-3">Current Stock: <strong>{product.countInStock}</strong></div>
      <form className="row g-2" onSubmit={onAdjust}>
        <div className="col-auto">
          <input type="number" className="form-control" value={form.delta}
            onChange={(e)=>setForm({ ...form, delta: e.target.value })} />
        </div>
        <div className="col-auto">
          <select className="form-select" value={form.reason}
            onChange={(e)=>setForm({ ...form, reason: e.target.value })}>
            {['order-placement','order-cancellation','manual-adjustment','return','correction','initial-stock'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="col-auto">
          <input className="form-control" placeholder="Note" value={form.note}
            onChange={(e)=>setForm({ ...form, note: e.target.value })} />
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" type="submit">Apply</button>
        </div>
      </form>

      <h5 className="mt-4">History</h5>
      <div className="table-responsive">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>Change</th>
              <th>Reason</th>
              <th>Previous</th>
              <th>New</th>
              <th>By</th>
              <th>Order</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h._id}>
                <td>{new Date(h.createdAt).toLocaleString()}</td>
                <td>{h.change}</td>
                <td>{h.reason}</td>
                <td>{h.previousStock}</td>
                <td>{h.newStock}</td>
                <td>{h.user ? h.user.name : '-'}</td>
                <td>{h.order ? h.order._id : '-'}</td>
                <td>{h.note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default function ProductInventoryPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <InventoryInner />
      </AdminRoute>
    </ProtectedRoute>
  );
}
