import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { authService } from '../services';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      setStatus({ type: 'success', message: response.message || 'Password reset email sent.' });
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to send reset email.';
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-5" style={{ marginTop: '120px', maxWidth: 600 }}>
        <h1 className="h3 mb-3">Forgot password</h1>
        <p className="text-muted mb-4">Enter your email address and we'll send you a reset code.</p>
        {status.message && (
          <div className={`alert alert-${status.type === 'success' ? 'success' : 'danger'}`}>
            {status.message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset email'}
          </button>
        </form>
        <div className="text-center mt-4">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
