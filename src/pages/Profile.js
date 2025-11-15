import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { userService, authService } from '../services';
import { useAuth } from '../context/AuthContext';

const emptyAddress = {
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  isDefault: false,
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [accountForm, setAccountForm] = useState({ name: '', email: '', phoneNumber: '', password: '' });
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [addressType, setAddressType] = useState('shipping');
  const [pageLoading, setPageLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser, logout } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setPageLoading(true);
      const response = await userService.getProfile();
      const data = response.user;
      setProfile(data);
      setAccountForm({
        name: data.name || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        password: '',
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to load profile.';
      setStatus({ type: 'error', message });
    } finally {
      setPageLoading(false);
    }
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: accountForm.name,
      email: accountForm.email,
      phoneNumber: accountForm.phoneNumber,
    };

    if (accountForm.password) {
      payload.password = accountForm.password;
    }

    try {
      const response = await userService.updateProfile(payload);
      setProfile((prev) => (prev ? { ...prev, ...response.user } : response.user));
      setAccountForm((prev) => ({ ...prev, password: '' }));
      setStatus({ type: 'success', message: 'Profile updated successfully.' });
      await refreshUser();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile.';
      setStatus({ type: 'error', message });
    }
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...addressForm };

    try {
      const response = await userService.addAddress(addressType, payload);
      const key = addressType === 'shipping' ? 'shippingAddress' : 'billingAddress';
      setProfile((prev) => (prev ? { ...prev, [key]: response[key] } : prev));
      setAddressForm(emptyAddress);
      setStatus({ type: 'success', message: `${addressType} address saved.` });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save address.';
      setStatus({ type: 'error', message });
    }
  };

  const handleAddressDelete = async (type, addressId) => {
    try {
      const response = await userService.deleteAddress(type, addressId);
      const key = type === 'shipping' ? 'shippingAddress' : 'billingAddress';
      setProfile((prev) => (prev ? { ...prev, [key]: response[key] } : prev));
      setStatus({ type: 'success', message: 'Address removed.' });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove address.';
      setStatus({ type: 'error', message });
    }
  };

  const handleResendVerification = async () => {
    if (!profile?.email) return;
    setStatus({ type: '', message: '' });
    setResendLoading(true);
    try {
      const response = await authService.resendVerification(profile.email);
      const message = response.message || 'Verification email sent. Please check your inbox.';
      setStatus({ type: 'success', message });
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to send verification email right now.';
      setStatus({ type: 'error', message });
    } finally {
      setResendLoading(false);
    }
  };

  const handleSetDefaultAddress = async (type, addressId) => {
    try {
      const response = await userService.updateAddress(type, addressId, { isDefault: true });
      const key = type === 'shipping' ? 'shippingAddress' : 'billingAddress';
      setProfile((prev) => (prev ? { ...prev, [key]: response[key] } : prev));
      setStatus({ type: 'success', message: 'Default address updated.' });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update address.';
      setStatus({ type: 'error', message });
    }
  };

  const renderAddressList = (addresses = [], type) => {
    if (!addresses.length) {
      return <p className="text-muted">No {type} addresses yet.</p>;
    }

    return addresses.map((address) => (
      <div className="border rounded p-3 mb-3" key={address._id}>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="mb-1 fw-semibold">{address.street}</p>
            <p className="mb-1 text-muted">
              {address.city}, {address.state}, {address.postalCode}
            </p>
            <p className="mb-0 text-muted">{address.country}</p>
          </div>
          <div className="text-end">
            {address.isDefault ? (
              <span className="badge bg-success">Default</span>
            ) : (
              <button
                className="btn btn-sm btn-outline-secondary mb-2"
                onClick={() => handleSetDefaultAddress(type, address._id)}
              >
                Set as default
              </button>
            )}
            <button
              className="btn btn-sm btn-outline-danger w-100"
              onClick={() => handleAddressDelete(type, address._id)}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    ));
  };

  if (pageLoading) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-5" style={{ marginTop: '120px' }}>
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="h3">My Profile</h1>
            <p className="text-muted mb-0">Manage your personal information and saved addresses.</p>
          </div>
        </div>

        {status.message && (
          <div className={`alert alert-${status.type === 'error' ? 'danger' : 'success'}`} role="alert">
            {status.message}
          </div>
        )}

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                    <span className="fw-bold" style={{ fontSize: '1.25rem' }}>
                      {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="ms-3">
                    <h5 className="mb-0">{profile?.name}</h5>
                    <small className="text-muted">{profile?.email}</small>
                    <div className="mt-1">
                      {profile?.isVerified ? (
                        <span className="badge bg-success">Email verified</span>
                      ) : (
                        <>
                          <span className="badge bg-warning text-dark">Verification pending</span>
                          <div className="mt-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={handleResendVerification}
                              disabled={resendLoading}
                            >
                              {resendLoading ? 'Sending…' : 'Resend verification email'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <hr />

                <form onSubmit={handleAccountSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={accountForm.name}
                      onChange={handleAccountChange}
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={accountForm.email}
                      onChange={handleAccountChange}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phoneNumber" className="form-label">Phone number</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={accountForm.phoneNumber}
                      onChange={handleAccountChange}
                      autoComplete="tel"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">New password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={accountForm.password}
                      onChange={handleAccountChange}
                      placeholder="Leave blank to keep current password"
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Save changes
                  </button>
                  <hr className="my-4" />
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100"
                    onClick={async () => { try { await logout(); navigate('/'); } catch(e) {} }}
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Saved addresses</h5>
                  <div className="btn-group" role="group" aria-label="Address type toggle">
                    <button
                      type="button"
                      className={`btn btn-sm ${addressType === 'shipping' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setAddressType('shipping')}
                    >
                      Shipping
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${addressType === 'billing' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setAddressType('billing')}
                    >
                      Billing
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAddressSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="street">Street address</label>
                      <input
                        type="text"
                        className="form-control"
                        id="street"
                        name="street"
                        value={addressForm.street}
                        onChange={handleAddressChange}
                        required
                        autoComplete="address-line1"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="city">City</label>
                      <input
                        type="text"
                        className="form-control"
                        id="city"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        required
                        autoComplete="address-level2"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="state">State</label>
                      <input
                        type="text"
                        className="form-control"
                        id="state"
                        name="state"
                        value={addressForm.state}
                        onChange={handleAddressChange}
                        required
                        autoComplete="address-level1"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label" htmlFor="postalCode">Postal code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="postalCode"
                        name="postalCode"
                        value={addressForm.postalCode}
                        onChange={handleAddressChange}
                        required
                        autoComplete="postal-code"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label" htmlFor="country">Country</label>
                      <input
                        type="text"
                        className="form-control"
                        id="country"
                        name="country"
                        value={addressForm.country}
                        onChange={handleAddressChange}
                        required
                        autoComplete="country-name"
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isDefault"
                          name="isDefault"
                          checked={addressForm.isDefault}
                          onChange={handleAddressChange}
                        />
                        <label className="form-check-label" htmlFor="isDefault">
                          Set as default {addressType} address
                        </label>
                      </div>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-outline-primary w-100">
                        Save {addressType} address
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="mb-3 text-capitalize">{addressType} address book</h5>
                {addressType === 'shipping'
                  ? renderAddressList(profile?.shippingAddress, 'shipping')
                  : renderAddressList(profile?.billingAddress, 'billing')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
