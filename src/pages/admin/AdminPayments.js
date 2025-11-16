import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { paymentService } from '../../services';

const PAGE_SIZE = 10;

const AdminPayments = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');

  const fetchData = async (opts = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, pageSize: PAGE_SIZE };
      if (opts.page) params.page = opts.page;
      const res = await fetch(`/api/payments?${new URLSearchParams(params)}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.message || 'Failed to load payments');
      let list = data.payments || [];
      if (status) list = list.filter(p => p.status === status);
      if (method) list = list.filter(p => p.paymentMethod === method);
      setItems(list);
      setPage(data.page || 1);
      setPages(data.pages || 1);
      setCount(data.count || list.length);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (paymentId, newStatus) => {
    if (!window.confirm(`Mark payment as ${newStatus}?`)) return;
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.message || 'Failed');
      await fetchData();
    } catch (e) {
      alert(e.message);
    }
  };

  const refundPayment = async (paymentId) => {
    if (!window.confirm('Trigger gateway refund for this payment?')) return;
    try {
      const res = await fetch(`/api/payments/${paymentId}/refund`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.message || 'Refund failed');
      await fetchData();
    } catch (e) { alert(e.message); }
  };

  const canPrev = page > 1;
  const canNext = page < pages;

  return (
    <AdminLayout title="Payments">
      <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center justify-content-between mb-3">
        <div className="d-flex gap-2">
          <select className="form-select" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select className="form-select" value={method} onChange={(e)=>setMethod(e.target.value)}>
            <option value="">All Methods</option>
            <option value="card">Card (Gateways)</option>
            <option value="bank-transfer">Bank Transfer</option>
            <option value="ussd">USSD</option>
            <option value="crypto">Crypto</option>
            <option value="cod">Cash on Delivery</option>
          </select>
          <button className="btn btn-outline-secondary" onClick={()=>fetchData()}>Apply</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-striped table-sm">
          <thead>
            <tr>
              <th>Created</th>
              <th>Order</th>
              <th>User</th>
              <th>Method</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-4"><div className="spinner-border" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="7" className="text-center">No payments</td></tr>
            ) : (
              items.map(p => (
                <tr key={p._id}>
                  <td>{new Date(p.createdAt).toLocaleString()}</td>
                  <td>{p.order}</td>
                  <td>{p.user?.name || p.user?.email || '-'}</td>
                  <td>{p.paymentMethod}</td>
                  <td><span className={`badge bg-${p.status === 'completed' ? 'success' : (p.status === 'pending' ? 'warning' : 'secondary')}`}>{p.status}</span></td>
                  <td>{p.currency} {Number(p.amount).toFixed(2)}</td>
                  <td>
                    <div className="d-none d-md-flex gap-2">
                      <button className="btn btn-sm btn-outline-success" disabled={p.status==='completed'} onClick={()=>updateStatus(p._id,'completed')}>Approve</button>
                      <button className="btn btn-sm btn-outline-danger" disabled={p.status==='failed'} onClick={()=>updateStatus(p._id,'failed')}>Reject</button>
                      <button className="btn btn-sm btn-outline-secondary" disabled={p.status==='refunded'} onClick={()=>refundPayment(p._id)}>Refund</button>
                    </div>
                    <div className="dropdown d-md-none">
                      <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Actions</button>
                      <ul className="dropdown-menu">
                        <li><button className="dropdown-item" disabled={p.status==='completed'} onClick={()=>updateStatus(p._id,'completed')}>Approve</button></li>
                        <li><button className="dropdown-item" disabled={p.status==='failed'} onClick={()=>updateStatus(p._id,'failed')}>Reject</button></li>
                        <li><button className="dropdown-item" disabled={p.status==='refunded'} onClick={()=>refundPayment(p._id)}>Refund</button></li>
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
    </AdminLayout>
  );
};

export default AdminPayments;
