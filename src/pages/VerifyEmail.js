import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import AnimatedSection from '../components/AnimatedSection';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (initialEmail && !email) setEmail(initialEmail);
  }, [initialEmail, email]);

  const handleVerify = useCallback(async (e) => {
    if (e) e.preventDefault();
    

    if (!email || code.trim().length !== 6) {
      toast.error('Enter your email and the 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email, token: code.trim() });
      await refreshUser();
      navigate('/profile', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [email, code, navigate, refreshUser, toast]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (code.trim().length === 6 && !loading) {
      handleVerify();
    }
  }, [code, loading, handleVerify]);

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email to resend the code.');
      return;
    }
    setResendLoading(true);
    try {
      await api.post('/auth/reset-verification', { email });
      toast.success('A new verification code has been sent to your email.');
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to resend code. Please try again later.';
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Layout>
      <AnimatedSection className="container-fluid page-header py-5" animationClass="animate-fade-up">
        <h1 className="text-center text-white display-6">Verify Email</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item active text-white">Verify Email</li>
        </ol>
      </AnimatedSection>
      <AnimatedSection className="container py-5" animationClass="animate-fade-up">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <h2 className="text-center text-primary mb-1">Verify your email</h2>
                <p className="text-center text-muted mb-4">Enter the 6-digit code we sent to your email</p>
                <form onSubmit={handleVerify}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

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
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Enter 6-digit code"
                      required
                    />
                    <div className="form-text">Code expires in 24 hours.</div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 btn-glow" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </form>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <button type="button" className="btn btn-link p-0" onClick={handleResend} disabled={resendLoading}>
                    {resendLoading ? 'Resending...' : 'Resend code'}
                  </button>
                  <Link to="/login" className="btn btn-link p-0">Back to sign in</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </Layout>
  );
};

export default VerifyEmail;
