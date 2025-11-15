import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdStrength, setPwdStrength] = useState({ score: 0, label: 'Very weak', color: 'danger' });
  const { register, refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === 'password') {
      setPwdStrength(evaluatePassword(e.target.value));
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
    setError('');
    setSuccessMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await register(formData.name, formData.email, formData.password);
      setSuccessMessage(response.message || 'Account created successfully. Please verify your email.');
      setPendingEmail(formData.email);
      // Move to verification step; keep email visible but clear passwords
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      setStep('verify');
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to create account.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!pendingEmail || verificationCode.trim().length !== 6) {
      setError('Enter the 6-digit code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email: pendingEmail, token: verificationCode.trim() });
      // Load the now-verified user into context
      await refreshUser();
      setSuccessMessage('Email verified! Redirecting to your dashboard...');
      // Redirect shortly after success
      setTimeout(() => navigate('/profile'), 700);
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (step === 'verify' && verificationCode.trim().length === 6 && !loading) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationCode, step]);

  const handleResend = async () => {
    if (!pendingEmail) return;
    setResendLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await api.post('/auth/reset-verification', { email: pendingEmail });
      setSuccessMessage('A new verification code has been sent to your email.');
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to resend code. Try again later.';
      setError(message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-5" style={{ marginTop: '120px' }}>
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                {step === 'register' ? (
                  <>
                    <h2 className="text-center text-primary mb-1">Create your account</h2>
                    <p className="text-center text-muted mb-4">Join the Raddazle community</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-center text-primary mb-1">Verify your email</h2>
                    <p className="text-center text-muted mb-4">We sent a 6-digit code to <strong>{pendingEmail}</strong></p>
                  </>
                )}

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="alert alert-success" role="alert">
                    {successMessage}
                  </div>
                )}

                {step === 'register' ? (
                  <>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">Full name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          autoComplete="name"
                          required
                        />
                      </div>

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
                        <div className="input-group">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            aria-describedby="passwordHelp registerPasswordToggle"
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            id="registerPasswordToggle"
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

                      <div className="mb-4">
                        <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
                        <div className="input-group">
                          <input
                            type={showConfirm ? 'text' : 'password'}
                            className="form-control"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            minLength={8}
                            autoComplete="new-password"
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setShowConfirm((s) => !s)}
                            aria-label={showConfirm ? 'Hide password' : 'Show password'}
                          >
                            {showConfirm ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                      </button>
                    </form>

                    <div className="text-center mt-4">
                      <span className="text-muted">Already have an account? </span>
                      <Link to="/login" className="text-primary text-decoration-none">Sign in</Link>
                    </div>
                  </>
                ) : (
                  <>
                    <form onSubmit={handleVerify}>
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
                        <div className="form-text">Code expires in 24 hours.</div>
                      </div>

                      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                      </button>
                    </form>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        onClick={handleResend}
                        disabled={resendLoading}
                      >
                        {resendLoading ? 'Resending...' : 'Resend code'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        onClick={() => setStep('register')}
                      >
                        Change email
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
