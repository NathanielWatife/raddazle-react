import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const { login, refreshUser, user, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);
      const role = data?.user?.role;
      if (role === 'admin' || role === 'super-admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Unable to login. Please check your credentials.';
      setError(message);
      setInfo('');
      if (status === 403 && /verify/i.test(message)) {
        setIsUnverified(true);
      } else {
        setIsUnverified(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!formData.email) {
      setError('Enter your email to resend the code.');
      return;
    }
    setResendLoading(true);
    setError('');
    setInfo('');
    try {
      await api.post('/auth/reset-verification', { email: formData.email });
      setInfo('A new verification code has been sent to your email.');
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to resend code. Please try again later.';
      setError(message);
    } finally {
      setResendLoading(false);
    }
  };

  const verifyNow = async () => {
    if (!formData.email || verificationCode.trim().length !== 6) {
      setError('Enter your email and the 6-digit code.');
      return;
    }
    setVerifyLoading(true);
    setError('');
    setInfo('');
    try {
      await api.post('/auth/verify-email', { email: formData.email, token: verificationCode.trim() });
      await refreshUser();
      navigate('/profile', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed. Please try again.';
      setError(message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    verifyNow();
  };

  // Auto-submit when unverified prompt is visible and code has 6 digits
  useEffect(() => {
    if (isUnverified && verificationCode.trim().length === 6 && !verifyLoading) {
      verifyNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationCode, isUnverified]);

  // If already authenticated, route admins to dashboard, customers to intended path/home
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin]);

  return (
    <Layout>
      <div className="container py-5" style={{ marginTop: '120px' }}>
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <h2 className="text-center text-primary mb-1">Welcome back</h2>
                <p className="text-center text-muted mb-4">Sign in to access your account</p>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {info && (
                  <div className="alert alert-info" role="alert">
                    {info}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end mb-4">
                    <Link to="/forgot-password" className="text-decoration-none">Forgot password?</Link>
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                {isUnverified && (
                  <div className="mt-4 p-3 border rounded-3">
                    <h6 className="mb-2">Verify your email</h6>
                    <p className="text-muted mb-3">Enter the 6-digit code sent to <strong>{formData.email}</strong> or resend the code.</p>
                    <form onSubmit={handleVerify} className="mb-2">
                      <div className="mb-3">
                        <label htmlFor="code" className="form-label">Verification code</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="\\d{6}"
                          maxLength={6}
                          className="form-control text-center"
                          id="code"
                          name="code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="Enter 6-digit code"
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-success w-100" disabled={verifyLoading}>
                        {verifyLoading ? 'Verifying...' : 'Verify & Continue'}
                      </button>
                    </form>
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      onClick={handleResend}
                      disabled={resendLoading}
                    >
                      {resendLoading ? 'Resending...' : 'Resend code'}
                    </button>
                  </div>
                )}

                <div className="text-center mt-4">
                  <span className="text-muted">Don't have an account? </span>
                  <Link to="/register" className="text-primary text-decoration-none">Create one</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
