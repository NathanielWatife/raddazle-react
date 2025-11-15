import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { authService } from '../services';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', verificationCode: '', password: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pwdStrength, setPwdStrength] = useState({ score: 0, label: 'Very weak', color: 'danger' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') {
      setPwdStrength(evaluatePassword(value));
    }
  };

  const evaluatePassword = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    let label = 'Very weak';
    let color = 'danger';
    switch (score) {
      case 0:
      case 1:
        label = 'Very weak';
        color = 'danger';
        break;
      case 2:
        label = 'Weak';
        color = 'danger';
        break;
      case 3:
        label = 'Fair';
        color = 'warning';
        break;
      case 4:
        label = 'Strong';
        color = 'info';
        break;
      case 5:
        label = 'Very strong';
        color = 'success';
        break;
      default:
        break;
    }
    return { score, label, color };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);
    try {
      await authService.resetPassword(form);
      setStatus({ type: 'success', message: 'Password successfully reset. Redirecting to login…' });
      setTimeout(() => navigate('/login'), 1800);
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to reset password. Please try again.';
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const email = params.get('email');
    const code = params.get('code');
    if (email || code) {
      setForm((prev) => ({
        ...prev,
        email: email || prev.email,
        verificationCode: code || prev.verificationCode,
      }));
    }
  }, [params]);

  return (
    <Layout>
      <div className="container py-5" style={{ marginTop: '120px', maxWidth: 600 }}>
        <h1 className="h3 mb-3">Reset password</h1>
        <p className="text-muted mb-4">Enter the verification code from your email and choose a new password.</p>
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
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="verificationCode" className="form-label">Verification code</label>
            <input
              type="text"
              id="verificationCode"
              name="verificationCode"
              inputMode="numeric"
              pattern="\\d{6}"
              maxLength={6}
              className="form-control text-center"
              value={form.verificationCode}
              onChange={(e) => setForm((prev) => ({ ...prev, verificationCode: e.target.value.replace(/[^0-9]/g, '') }))}
              required
              autoComplete="one-time-code"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">New password</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
                aria-describedby="passwordHelp passwordToggle"
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                id="passwordToggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="mt-2" id="passwordHelp">
              <div className="progress" style={{ height: 6 }}>
                <div
                  className={`progress-bar bg-${pwdStrength.color}`}
                  role="progressbar"
                  style={{ width: `${(pwdStrength.score / 5) * 100}%` }}
                  aria-valuenow={(pwdStrength.score / 5) * 100}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
              <small className={`text-${pwdStrength.color}`}>{pwdStrength.label}</small>
            </div>
          </div>
          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? 'Updating…' : 'Reset password'}
          </button>
        </form>
        <div className="text-center mt-4">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
