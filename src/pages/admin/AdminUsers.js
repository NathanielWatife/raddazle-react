import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';

const AdminUsers = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
    page: 1,
    limit: 20
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super-admin';
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(filters);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(u => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.info('Please select users first');
      return;
    }

    const ok = await confirm.confirm({ title: `${action[0].toUpperCase()+action.slice(1)} users?`, message: `Apply ${action} to ${selectedUsers.length} user(s)?`, variant: action === 'delete' ? 'danger' : 'warning', okText: action[0].toUpperCase()+action.slice(1) });
    if (!ok) return;

    try {
      await adminService.bulkAction(action, selectedUsers);
      toast.success(`Successfully ${action}d users`);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error(`Failed to ${action} users`);
    }
  };

  const handleRoleChange = async (u, newRole) => {
    if (!isSuperAdmin) return;
    if (u.role === 'super-admin' && user._id !== u._id) {
      const ok = await confirm.confirm({ title: 'Modify super-admin?', message: 'Are you sure you want to change another super-admin\'s role?', variant: 'danger', okText: 'Proceed' });
      if (!ok) return;
    }
    try {
      await adminService.updateUser(u._id, { role: newRole });
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update role');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await adminService.exportUsers();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users-export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export users');
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : '-';
  };

  return (
    <AdminLayout title="Users Management">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-1 pb-2 mb-3 border-bottom">
        <div />
        <div className="btn-toolbar mb-2 mb-md-0">
          <button 
            type="button" 
            className="btn btn-sm btn-outline-secondary"
            onClick={handleExport}
          >
            <i className="fas fa-download me-1"></i>Export CSV
          </button>
        </div>
      </div>

          {/* Filters */}
          <div className="row mb-3">
            <div className="col-md-4">
              <input 
                type="search" 
                className="form-control" 
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mb-3">
              <div className="btn-group" role="group">
                <button 
                  className="btn btn-sm btn-success"
                  onClick={() => handleBulkAction('activate')}
                >
                  Activate
                </button>
                <button 
                  className="btn btn-sm btn-warning"
                  onClick={() => handleBulkAction('suspend')}
                >
                  Suspend
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </button>
              </div>
              <span className="ms-3">{selectedUsers.length} user(s) selected</span>
            </div>
          )}

      {/* Users Table */}
      <div className="table-responsive">
            <table className="table table-striped table-sm">
              <thead>
                <tr>
                  <th>
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={selectedUsers.length === users.length && users.length > 0}
                    />
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="col-optional">Verified</th>
                  <th className="col-optional">Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                        />
                      </td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        {isSuperAdmin ? (
                          <select
                            className="form-select form-select-sm"
                            value={user.role}
                            onChange={(e)=>handleRoleChange(user, e.target.value)}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                            <option value="super-admin">super-admin</option>
                          </select>
                        ) : (
                          <span className={`badge bg-${user.role === 'admin' ? 'danger' : 'primary'}`}>{user.role}</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge bg-${user.status === 'active' ? 'success' : 'warning'}`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="col-optional">
                        {user.isVerified ? (
                          <i className="fas fa-check-circle text-success"></i>
                        ) : (
                          <i className="fas fa-times-circle text-danger"></i>
                        )}
                      </td>
                      <td className="col-optional">{formatDate(user.createdAt)}</td>
                      <td>
                        {/* Future per-user actions can go here (view, activity logs, etc.) */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
