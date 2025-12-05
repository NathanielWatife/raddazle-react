import React, { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { paymentService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const PAGE_SIZE = 10;

const AdminPayments = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');

  const fetchData = useCallback(async (opts = {}) => {
    setLoading(true);
    try {
      const params = { page, pageSize: PAGE_SIZE };
      if (opts.page) params.page = opts.page;
      const data = await paymentService.getAll(params);
      let list = data.payments || [];
      if (status) list = list.filter(p => p.status === status);
      if (method) list = list.filter(p => p.paymentMethod === method);
      setItems(list);
      setPage(data.page || 1);
      setPages(data.pages || 1);
      setCount(data.count || list.length);
    } catch (e) {
      toast.error(e.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page, status, method, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (paymentId, newStatus) => {
    const ok = await confirm.confirm({
      variant: newStatus === 'completed' ? 'info' : 'warning',
      title: `Confirm ${newStatus}`,
      message: `Are you sure you want to mark this payment as ${newStatus}?`,
      okText: 'Yes',
      cancelText: 'No'
    });
    if (!ok) return;
    try {
      await paymentService.updateStatus(paymentId, newStatus);
      await fetchData();
    } catch (e) {
      toast.error(e.message || 'Failed to update payment');
    }
  };

  const refundPayment = async (paymentId) => {
    const ok = await confirm.confirm({
      variant: 'danger',
      title: 'Refund Payment',
      message: 'Trigger a gateway refund for this payment? This action cannot be undone.',
      okText: 'Refund',
      cancelText: 'Cancel'
    });
    if (!ok) return;
    try {
      await paymentService.refund(paymentId);
      await fetchData();
    } catch (e) { toast.error(e.message || 'Refund failed'); }
  };

  const canPrev = page > 1;
  const canNext = page < pages;

  return (
    <AdminLayout title="Payments">
      <div className="admin-page-header">
        <div className="d-flex gap-2 flex-wrap flex-grow-1">
          <select className="form-select" style={{maxWidth: '180px'}} value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select className="form-select" style={{maxWidth: '180px'}} value={method} onChange={(e)=>setMethod(e.target.value)}>
            <option value="">All Methods</option>
            <option value="card">Card</option>
            <option value="bank-transfer">Bank</option>
            <option value="ussd">USSD</option>
            <option value="crypto">Crypto</option>
            <option value="cod">COD</option>
          </select>
          <button className="btn btn-outline-secondary" onClick={()=>fetchData()}>
            <i className="fas fa-filter d-sm-none"></i>
            <span className="d-none d-sm-inline">Apply</span>
          </button>
        </div>
      </div>

      {/* Errors shown via overlay toasts */}

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
