import React, { useEffect, useState } from 'react';
import { orderService } from '../../services';
import ProtectedRoute from '../../components/ProtectedRoute';
import AdminRoute from '../../components/AdminRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';

const statusOptions = ['pending','processing','shipped','delivered','cancelled'];

const OrdersAdmin = () => {
  const [data, setData] = useState({ orders: [], page: 1, pages: 1, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shipForms, setShipForms] = useState({});
  const [shipModalOrder, setShipModalOrder] = useState(null);
  const toast = useToast();

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await orderService.getAll({ page, pageSize: 10 });
      setData(res);
    } catch (e) {
      setError('');
      toast.error(e.response?.data?.message || e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const onUpdateStatus = async (id, status) => {
    await orderService.updateStatus(id, status);
    await fetchOrders(data.page);
  };

  const onDeliver = async (id) => {
    await orderService.deliver(id);
    await fetchOrders(data.page);
  };

  const onCancel = async (id) => {
    await orderService.cancel(id);
    await fetchOrders(data.page);
  };

  const onShip = async (id) => {
    const payload = shipForms[id] || {};
    if (!payload.trackingNumber) return;
    await orderService.ship(id, payload);
    setShipForms({ ...shipForms, [id]: {} });
    await fetchOrders(data.page);
  };

  const handleShipChange = (id, field, value) => {
    setShipForms(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  };

  const openShipModal = (order) => setShipModalOrder(order);
  const closeShipModal = () => setShipModalOrder(null);

  return (
    <AdminLayout title="Orders">
      {/* Errors shown via overlay toasts */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" /></div>
      ) : (
        <>
        <div className="table-responsive">
          <table className="table table-striped table-sm align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Total</th>
                <th>Status</th>
                <th className="col-optional">Paid</th>
                <th className="col-optional">Delivered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map(o => (
                <React.Fragment key={o._id}>
                <tr>
                  <td className="truncate">{o._id}</td>
                  <td>{o.user?.name || '-'}</td>
                  <td>${o.totalPrice?.toFixed(2)}</td>
                  <td>
                    <select className="form-select form-select-sm" value={o.status}
                      onChange={(e) => onUpdateStatus(o._id, e.target.value)}>
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="col-optional">{o.isPaid ? 'Yes' : 'No'}</td>
                  <td className="col-optional">{o.isDelivered ? 'Yes' : 'No'}</td>
                  <td>
                    {/* Desktop/tablet actions */}
                    <div className="d-none d-md-flex gap-2 flex-wrap align-items-center">
                      {!o.isDelivered && (
                        <button className="btn btn-sm btn-success" onClick={() => onDeliver(o._id)}>Deliver</button>
                      )}
                      {o.status !== 'cancelled' && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => onCancel(o._id)}>Cancel</button>
                      )}
                      <div className="d-flex align-items-center gap-2">
                        <input className="form-control form-control-sm" placeholder="Tracking #"
                          value={shipForms[o._id]?.trackingNumber || ''}
                          onChange={(e)=>handleShipChange(o._id,'trackingNumber',e.target.value)} />
                        <input className="form-control form-control-sm" placeholder="Carrier"
                          value={shipForms[o._id]?.shippingCarrier || ''}
                          onChange={(e)=>handleShipChange(o._id,'shippingCarrier',e.target.value)} />
                        <input className="form-control form-control-sm" placeholder="Tracking URL"
                          value={shipForms[o._id]?.trackingUrl || ''}
                          onChange={(e)=>handleShipChange(o._id,'trackingUrl',e.target.value)} />
                        <input type="date" className="form-control form-control-sm" placeholder="ETA"
                          value={shipForms[o._id]?.estimatedDelivery || ''}
                          onChange={(e)=>handleShipChange(o._id,'estimatedDelivery',e.target.value)} />
                        <button className="btn btn-sm btn-primary" onClick={() => onShip(o._id)}>Ship</button>
                      </div>
                    </div>

                    {/* Mobile actions dropdown */}
                    <div className="dropdown d-md-none">
                      <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        Actions
                      </button>
                      <ul className="dropdown-menu">
                        {!o.isDelivered && (
                          <li><button className="dropdown-item" onClick={() => onDeliver(o._id)}><i className="fas fa-check me-2"></i>Deliver</button></li>
                        )}
                        {o.status !== 'cancelled' && (
                          <li><button className="dropdown-item text-danger" onClick={() => onCancel(o._id)}><i className="fas fa-times me-2"></i>Cancel</button></li>
                        )}
                        <li><button className="dropdown-item" onClick={() => openShipModal(o)}><i className="fas fa-shipping-fast me-2"></i>Shipping form</button></li>
                      </ul>
                    </div>
                  </td>
                </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {shipModalOrder && (
          <>
            <div className="adm-modal-backdrop" onClick={closeShipModal} />
            <div className="adm-modal" role="dialog" aria-modal="true" aria-labelledby="shipModalTitle">
              <div className="adm-modal-header">
                <h6 id="shipModalTitle" className="mb-0">Ship Order #{shipModalOrder._id.slice(-6)}</h6>
                <button className="btn btn-sm btn-outline-secondary" onClick={closeShipModal} aria-label="Close">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="adm-modal-body">
                <div className="row g-2">
                  <div className="col-12 col-sm-6">
                    <input className="form-control form-control-sm" placeholder="Tracking #"
                      value={shipForms[shipModalOrder._id]?.trackingNumber || ''}
                      onChange={(e)=>handleShipChange(shipModalOrder._id,'trackingNumber',e.target.value)} />
                  </div>
                  <div className="col-12 col-sm-6">
                    <input className="form-control form-control-sm" placeholder="Carrier"
                      value={shipForms[shipModalOrder._id]?.shippingCarrier || ''}
                      onChange={(e)=>handleShipChange(shipModalOrder._id,'shippingCarrier',e.target.value)} />
                  </div>
                  <div className="col-12">
                    <input className="form-control form-control-sm" placeholder="Tracking URL"
                      value={shipForms[shipModalOrder._id]?.trackingUrl || ''}
                      onChange={(e)=>handleShipChange(shipModalOrder._id,'trackingUrl',e.target.value)} />
                  </div>
                  <div className="col-12 col-sm-6">
                    <input type="date" className="form-control form-control-sm" placeholder="ETA"
                      value={shipForms[shipModalOrder._id]?.estimatedDelivery || ''}
                      onChange={(e)=>handleShipChange(shipModalOrder._id,'estimatedDelivery',e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="adm-modal-footer">
                <button className="btn btn-sm btn-outline-secondary" onClick={closeShipModal}>Cancel</button>
                <button className="btn btn-sm btn-primary" onClick={() => { onShip(shipModalOrder._id); closeShipModal(); }}>Ship</button>
              </div>
            </div>
          </>
        )}
        </>
      )}
    </AdminLayout>
  );
};

export default function OrdersAdminPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <OrdersAdmin />
      </AdminRoute>
    </ProtectedRoute>
  );
}
