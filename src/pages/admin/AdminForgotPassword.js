import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services';
import { useToast } from '../../context/ToastContext';

const AdminForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      toast.success(response.message || 'Password reset email sent successfully!');
      setEmailSent(true);
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to send reset email. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="text-primary">Admin Password Reset</h2>
                <p className="text-muted">
                  {emailSent 
                    ? 'Check your email for reset instructions' 
                    : 'Enter your email address to receive a password reset code'}
                </p>
              </div>
              
              {emailSent ? (
                <div className="alert alert-success text-center">
                  <i className="fas fa-check-circle fa-3x mb-3 text-success"></i>
                  <h5>Email Sent!</h5>
                  <p className="mb-3">
                    We've sent a 6-digit verification code and reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-muted small mb-3">
                    Please check your inbox (and spam folder) for the reset instructions.
                  </p>
                  <Link 
                    to="/admin/reset-password" 
                    className="btn btn-primary w-100 mb-2"
                  >
                    Go to Reset Password
                  </Link>
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setEmailSent(false)}
                  >
                    Send Another Email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      autoFocus
                    />
                    <small className="text-muted">
                      Enter the email associated with your admin account
                    </small>
                  </div>
                  
                  <button 
                    className="btn btn-primary w-100 mb-3" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : (
                      'Send Reset Code'
                    )}
                  </button>
                </form>
              )}
              
              <div className="text-center mt-3">
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

export default AdminForgotPassword;
