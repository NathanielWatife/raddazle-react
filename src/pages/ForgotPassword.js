import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import AnimatedSection from '../components/AnimatedSection';
import { authService } from '../services';
import { useToast } from '../context/ToastContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      toast.success(response.message || 'Password reset email sent.');
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to send reset email.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <AnimatedSection className="container-fluid page-header py-5" animationClass="animate-fade-up">
        <h1 className="text-center text-white display-6">Forgot Password</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item"><a href="/">Home</a></li>
          <li className="breadcrumb-item active text-white">Forgot Password</li>
        </ol>
      </AnimatedSection>
      <AnimatedSection className="container py-5" style={{ maxWidth: 600 }} animationClass="animate-fade-up">
        <h1 className="h3 mb-3">Forgot password</h1>
        <p className="text-muted mb-4">Enter your email address and we'll send you a reset code.</p>
        
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
          <button className="btn btn-primary w-100 btn-glow" type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset email'}
          </button>
        </form>
        <div className="text-center mt-4">
          <Link to="/login">Back to login</Link>
        </div>
      </AnimatedSection>
    </Layout>
  );
};

export default ForgotPassword;
