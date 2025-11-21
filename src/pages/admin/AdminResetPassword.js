import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services';
import { useToast } from '../../context/ToastContext';

const AdminResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ 
    email: '', 
    verificationCode: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pwdStrength, setPwdStrength] = useState({ 
    score: 0, 
    label: 'Very weak', 
    color: 'danger' 
  });
  const toast = useToast();

  // Pre-fill email and code from URL parameters (from email link)
  useEffect(() => {
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
    
    // Validate password strength
    if (pwdStrength.score < 3) {
      toast.error('Please choose a stronger password');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(form);
      toast.success('Password reset successful! Redirecting to admin login...');
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to reset password. Please verify your code and try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="text-primary">Reset Admin Password</h2>
                <p className="text-muted">Enter your verification code and new password</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    placeholder="admin@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="verificationCode" className="form-label">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    className="form-control text-center fs-4 fw-bold"
                    placeholder="000000"
                    value={form.verificationCode}
                    onChange={(e) => setForm((prev) => ({ 
                      ...prev, 
                      verificationCode: e.target.value.replace(/[^0-9]/g, '') 
                    }))}
                    required
                    autoComplete="one-time-code"
                  />
                  <small className="text-muted">
                    Enter the 6-digit code from your email
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    New Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      className="form-control"
                      placeholder="Enter new password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                  <small className="text-muted d-block mt-1">
                    Minimum 8 characters, include uppercase, lowercase, numbers, and symbols
                  </small>
                  
                  {form.password && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Password strength:</small>
                        <small className={`text-${pwdStrength.color} fw-bold`}>
                          {pwdStrength.label}
                        </small>
                      </div>
                      <div className="progress" style={{ height: '5px' }}>
                        <div
                          className={`progress-bar bg-${pwdStrength.color}`}
                          role="progressbar"
                          style={{ width: `${(pwdStrength.score / 5) * 100}%` }}
                          aria-valuenow={pwdStrength.score}
                          aria-valuemin="0"
                          aria-valuemax="5"
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading || pwdStrength.score < 3}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="text-muted small mb-2">Didn't receive a code?</p>
                <Link to="/admin/forgot-password" className="text-decoration-none d-block mb-2">
                  Resend verification code
                </Link>
                <Link to="/admin/login" className="text-decoration-none">
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Admin Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResetPassword;
