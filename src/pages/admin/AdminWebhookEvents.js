import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';

const PAGE_SIZE = 20;

const AdminWebhookEvents = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [count, setCount] = useState(0);
  const [provider, setProvider] = useState('');
  const [handled, setHandled] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [reference, setReference] = useState('');
  const [selected, setSelected] = useState(null);
  const [exporting, setExporting] = useState(false);
  const toast = useToast();

  const fetchData = async (opts = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, pageSize: PAGE_SIZE };
      if (provider) params.provider = provider;
      if (status) params.status = status;
      if (handled) params.handled = handled;
      if (q) params.q = q;
      if (opts.page) params.page = opts.page;
      if (reference) params.reference = reference;
      const res = await fetch(`/api/admin/webhook-events?${new URLSearchParams(params)}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || data.success === false) throw new Error(data.message || 'Failed to load');
      setItems(data.events || []);
      setPage(data.page || 1);
      setPages(data.pages || 1);
      setCount(data.count || 0);
    } catch (e) {
      setError('');
      toast.error(e.message || 'Failed to load webhook events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const canPrev = page > 1;
  const canNext = page < pages;

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportCsv = async () => {
    try {
      setExporting(true);
      const baseParams = { pageSize: 200, page: 1 };
      if (provider) baseParams.provider = provider;
      if (status) baseParams.status = status;
      if (handled) baseParams.handled = handled;
      if (q) baseParams.q = q;
      if (reference) baseParams.reference = reference;

      const rows = [];
      let currentPage = 1;
      let totalPages = 1;
      const MAX_EVENTS = 5000;
      while (currentPage <= totalPages && rows.length < MAX_EVENTS) {
        const params = new URLSearchParams({ ...baseParams, page: String(currentPage) });
        const res = await fetch(`/api/admin/webhook-events?${params.toString()}`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || data.success === false) throw new Error(data.message || 'Failed to export');
        const evs = data.events || [];
        evs.forEach(ev => {
          rows.push({
            id: ev._id,
            eventId: ev.eventId,
            provider: ev.provider,
            reference: ev.reference || '',
            payment: ev.payment || '',
            order: ev.order || '',
            handled: ev.handled ? 'true' : 'false',
            status: ev.status || '',
            createdAt: ev.createdAt,
            receivedAt: ev.receivedAt || '',
          });
        });
        totalPages = data.pages || 1;
        currentPage += 1;
        if (evs.length === 0) break;
      }

      const headers = ['id','eventId','provider','reference','payment','order','handled','status','createdAt','receivedAt'];
      const csvLines = [headers.join(',')];
      for (const r of rows) {
        const line = headers.map(h => {
          const val = r[h] ?? '';
          const s = String(val).replace(/"/g, '""');
          return /[",\n]/.test(s) ? `"${s}` + '"' : s;
        }).join(',');
        csvLines.push(line);
      }
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      downloadBlob(blob, `webhook-events-${ts}.csv`);
    } catch (e) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout title="Webhook Events">
      <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center justify-content-between mb-3">
        <div className="d-flex flex-wrap gap-2">
          <select className="form-select" value={provider} onChange={(e)=>setProvider(e.target.value)}>
            <option value="">All Providers</option>
            <option value="paystack">Paystack</option>
            <option value="flutterwave">Flutterwave</option>
          </select>
          <select className="form-select" value={handled} onChange={(e)=>setHandled(e.target.value)}>
            <option value="">Any Handling</option>
            <option value="true">Handled</option>
            <option value="false">Unprocessed</option>
          </select>
          <select className="form-select" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">Any Status</option>
            <option value="processed">Processed</option>
            <option value="error">Error</option>
          </select>
          <input className="form-control" placeholder="Search event id" value={q} onChange={(e)=>setQ(e.target.value)} />
          <input className="form-control" placeholder="Reference" value={reference} onChange={(e)=>setReference(e.target.value)} />
          <button className="btn btn-outline-secondary" onClick={()=>fetchData({ page: 1 })}>Apply</button>
        </div>
        <div className="ms-md-auto">
          <button className="btn btn-sm btn-outline-primary" onClick={exportCsv} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Errors shown via overlay toasts */}

      <div className="table-responsive">
        <table className="table table-striped table-sm">
          <thead>
            <tr>
              <th>Received</th>
              <th>Provider</th>
              <th>Reference</th>
              <th>Payment</th>
              <th>Order</th>
              <th>Handled</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-4"><div className="spinner-border" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="7" className="text-center">No events</td></tr>
            ) : (
              items.map(ev => (
                <tr key={ev._id}>
                  <td>{new Date(ev.receivedAt || ev.createdAt).toLocaleString()}</td>
                  <td>{ev.provider}</td>
                  <td>{ev.reference || '-'}</td>
                  <td>{ev.payment || '-'}</td>
                  <td>{ev.order || '-'}</td>
                  <td>{ev.handled ? 'Yes' : 'No'}</td>
                  <td className="d-flex align-items-center gap-2">
                    <span>{ev.status || '-'}</span>
                    <button className="btn btn-sm btn-outline-secondary" onClick={()=>setSelected(ev)}>Details</button>
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

      {selected && (
        <div className="position-fixed top-0 start-0 w-100 h-100" style={{background:'rgba(0,0,0,0.5)', zIndex:1050}} onClick={()=>setSelected(null)}>
          <div className="position-absolute top-50 start-50 translate-middle bg-dark text-light p-3 rounded shadow" style={{width:'min(900px, 92vw)', maxHeight:'90vh', overflow:'auto'}} onClick={e=>e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Webhook Event Details</h6>
              <button className="btn btn-sm btn-outline-secondary" onClick={()=>setSelected(null)} aria-label="Close">Close</button>
            </div>
            <div className="small">
              <div><strong>Event ID:</strong> {selected.eventId}</div>
              <div><strong>Provider:</strong> {selected.provider}</div>
              <div><strong>Reference:</strong> {selected.reference || '-'}</div>
              <div><strong>Payment:</strong> {selected.payment || '-'}</div>
              <div><strong>Order:</strong> {selected.order || '-'}</div>
              <div><strong>Handled:</strong> {selected.handled ? 'Yes' : 'No'}</div>
              <div><strong>Status:</strong> {selected.status || '-'}</div>
              <div><strong>Received:</strong> {new Date(selected.receivedAt || selected.createdAt).toLocaleString()}</div>
            </div>
            <hr />
            <div>
              <div className="mb-1"><strong>Payload (masked)</strong></div>
              <pre className="bg-black text-light p-2 rounded" style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(selected.payload, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminWebhookEvents;
